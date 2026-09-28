(function (global) {
  'use strict';

  const history = [];
  let historyIndex = 0;
  let historyDraft = '';
  let config;
  let siteMap;
  let mount;
  let activeLine;
  let outputRows = [];
  let siteRoot;

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function makePromptLine() {
    const row = makeElement('div', 'shell-line prompt-line');
    const textLine = makeElement('p');
    textLine.appendChild(makeElement('span', 'prompt-prefix', config.promptPrefix || '> '));
    const text = makeElement('span', 'prompt-text');
    const cursor = makeElement('span', 'blink prompt-cursor', '\u2588');
    textLine.append(text, cursor);
    row.appendChild(textLine);
    mount.appendChild(row);
    activeLine = { row, text, cursor, position: 0 };
    return activeLine;
  }

  function setActiveText(value, position = value.length) {
    if (!activeLine) return;
    activeLine.text.textContent = value;
    activeLine.position = Math.max(0, Math.min(position, value.length));
    if (activeLine.trailing) {
      activeLine.trailing.remove();
      activeLine.trailing = null;
    }
    activeLine.cursor.textContent = '\u2588';
    activeLine.cursor.classList.add('blink');
    activeLine.cursor.style.display = '';
    if (activeLine.position < value.length) {
      activeLine.text.textContent = value.slice(0, activeLine.position);
      activeLine.cursor.textContent = value[activeLine.position];
      activeLine.cursor.classList.remove('blink');
      activeLine.cursor.after(makeElement('span', 'prompt-trailing', value.slice(activeLine.position + 1)));
      activeLine.trailing = activeLine.cursor.nextElementSibling;
    } else {
      activeLine.text.textContent = value;
    }
  }

  function activeText() {
    if (!activeLine) return '';
    return activeLine.text.textContent + activeLine.cursor.textContent.replace('\u2588', '') +
      (activeLine.trailing ? activeLine.trailing.textContent : '');
  }

  function trimOutput() {
    const maxLines = Number.isInteger(config.historyLimit) ? config.historyLimit : 6;
    while (outputRows.length > maxLines && maxLines > 0) {
      const oldRow = outputRows.shift();
      if (oldRow.isConnected) oldRow.remove();
    }
    if (maxLines === 0) {
      outputRows.forEach(row => row.remove());
      outputRows = [];
    }
  }

  function writeMessage(message, isError = false) {
    if (message === undefined || message === null || message === '') return;
    const status = config.statusSelector && document.querySelector(config.statusSelector);
    if (status) {
      status.textContent = String(message);
      status.classList.toggle('error', isError);
      return;
    }
    const row = makeElement('p', `shell-output${isError ? ' wrong' : ''}`, String(message));
    row.style.whiteSpace = 'pre-wrap';
    mount.appendChild(row);
    outputRows.push(row);
    trimOutput();
  }

  function currentDirectory() {
    return config.currentDirectory || 'root';
  }

  function normalizePath(inputPath, basePath = currentDirectory()) {
    const parts = inputPath.startsWith('/') ? [] : basePath.split('/').filter(Boolean);
    for (const part of inputPath.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    return parts.join('/') || 'root';
  }

  function directoryEntry(path) {
    return siteMap.directories[path];
  }

  function findApp(path, alias) {
    const apps = Object.values(siteMap.apps);
    return apps.find(app => app.path === path) ||
      (alias ? apps.find(app => (app.aliases || []).includes(alias)) : undefined);
  }

  function launchApp(app, args = []) {
    const expected = app.args || [];
    if (expected.length && (expected.length !== args.length || expected.some((arg, i) => args[i] !== arg))) {
      throw new Error(`usage: run ${app.path} ${expected.join(' ')}`);
    }
    if (!expected.length && args.length) throw new Error(`unexpected option: ${args.join(' ')}`);
    const destination = new URL(app.href, siteRoot);
    global.location.assign(destination.href);
    return true;
  }

  function listDirectory(path = currentDirectory()) {
    const directory = directoryEntry(path);
    if (!directory) throw new Error(`not a directory: ${path}`);
    const rows = (directory.children || []).map(child => `${child.split('/').pop()}/`);
    for (const app of Object.values(siteMap.apps)) {
      if (app.parent === path) {
        rows.push(`run ${app.path} ${(app.args || []).join(' ')}  —  ${app.description}`.trim());
      }
    }
    return rows.length ? rows.join('\n') : '(empty)';
  }

  function showHelp() {
    const builtIns = [
      'help             list commands available here',
      'about            describe this page',
      'ls               list child locations and apps',
      'cd <path>        change the current location',
      'run <path> <arg> launch a registered app',
      'exit / Escape    return to the configured exit page',
      'clear            clear visible prompt output'
    ];
    const pageCommands = Object.entries(config.commands || {}).map(([name, command]) => {
      const details = typeof command === 'function' ? {} : command;
      const usage = details.usage || name;
      return `${usage.padEnd(24)} ${details.description || ''}`.trimEnd();
    });
    const appCommands = Object.values(siteMap.apps).map(app => {
      const usage = `run ${app.path} ${(app.args || []).join(' ')}`.trim();
      const aliases = app.aliases && app.aliases.length ? ` (aliases: ${app.aliases.join(', ')})` : '';
      return `${usage.padEnd(40)} ${app.description || ''}${aliases}`.trimEnd();
    });
    writeMessage([...builtIns, ...pageCommands, '', 'Available apps:', ...appCommands].join('\n'));
  }

  function dispatch(commandText) {
    const raw = commandText.trim();
    if (!raw) return false;
    const [verb, ...args] = raw.split(/\s+/);
    const lowerVerb = verb.toLowerCase();

    if (lowerVerb === 'help') {
      showHelp();
      return false;
    }
    if (lowerVerb === 'about') {
      writeMessage(config.about || config.title || config.pageId || 'No page description configured.');
      return false;
    }
    if (lowerVerb === 'ls') {
      writeMessage(listDirectory(args[0] ? normalizePath(args[0]) : currentDirectory()));
      return false;
    }
    if (lowerVerb === 'cd') {
      if (!args.length) throw new Error('usage: cd <path>');
      const destination = normalizePath(args[0]);
      if (!directoryEntry(destination)) throw new Error(`not a directory: ${args[0]}`);
      config.currentDirectory = destination;
      writeMessage(destination === 'root' ? '/' : `/${destination}`);
      return false;
    }
    if (lowerVerb === 'run') {
      if (!args.length) throw new Error('usage: run <site/path> [app arguments]');
      const path = args.shift().replace(/^\.\//, '').replace(/^\//, '');
      const app = findApp(path);
      if (!app) throw new Error(`app not found: ${path}`);
      return launchApp(app, args);
    }
    if (lowerVerb === 'exit') {
      return exitPage();
    }
    if (lowerVerb === 'clear' || lowerVerb === 'cls') {
      mount.replaceChildren();
      outputRows = [];
      return false;
    }

    const shorthand = findApp('', lowerVerb);
    if (shorthand && args.length === 0) return launchApp(shorthand, shorthand.args || []);

    if (typeof config.onCommand === 'function') {
      const result = config.onCommand(raw, { config, siteMap, writeMessage, launchApp });
      if (result !== undefined && result !== false) {
        if (typeof result === 'string') writeMessage(result);
        else if (result.message) writeMessage(result.message, result.error);
        return Boolean(result.navigate);
      }
    }

    const commandName = raw.match(/^([\w-]+)(?:=|\s|$)/)?.[1]?.toLowerCase();
    const commandDefinition = config.commands && config.commands[commandName];
    const commandHandler = typeof commandDefinition === 'function' ? commandDefinition : commandDefinition?.run;
    if (typeof commandHandler === 'function') {
      const result = commandHandler({ raw, args, config, siteMap, writeMessage, launchApp });
      if (typeof result === 'string') writeMessage(result);
      else if (result && result.message) writeMessage(result.message, result.error);
      return Boolean(result && result.navigate);
    }
    throw new Error(`command not found: ${verb}; type help`);
  }

  function exitPage() {
    const targetId = config.exitTarget || siteMap.homePage;
    const target = siteMap.pages[targetId];
    if (!target) throw new Error(`exit target is not configured: ${targetId}`);
    if (config.pageId === targetId) {
      writeMessage('already at the site root');
      return false;
    }
    global.location.assign(new URL(target.href, siteRoot).href);
    return true;
  }

  function submitActiveLine() {
    const command = activeText();
    if (!command.trim()) return;
    history.push(command);
    historyIndex = history.length;
    historyDraft = '';

    const echo = config.echoCommands !== false;
    if (echo && activeLine) {
      activeLine.row.classList.remove('prompt-line');
      activeLine.cursor.remove();
      activeLine = null;
      outputRows.push(mount.lastElementChild);
      trimOutput();
    } else if (activeLine) {
      activeLine.row.remove();
      activeLine = null;
    }

    try {
      const navigated = dispatch(command);
      if (!navigated && !activeLine) makePromptLine();
    } catch (error) {
      writeMessage(error.message, true);
      if (!activeLine) makePromptLine();
    }
  }

  function input(key) {
    if (!activeLine) return;
    const value = activeText();
    let position = activeLine.position;

    if (key === 'Escape') {
      exitPage();
    } else if (key === 'Enter') {
      submitActiveLine();
    } else if (key === 'Backspace') {
      if (position > 0) setActiveText(value.slice(0, position - 1) + value.slice(position), position - 1);
    } else if (key === 'Delete') {
      if (position < value.length) setActiveText(value.slice(0, position) + value.slice(position + 1), position);
    } else if (key === 'ArrowLeft') {
      setActiveText(value, Math.max(0, position - 1));
    } else if (key === 'ArrowRight') {
      setActiveText(value, Math.min(value.length, position + 1));
    } else if (key === 'ArrowUp') {
      if (historyIndex === history.length) historyDraft = value;
      historyIndex = Math.max(0, historyIndex - 1);
      setActiveText(history[historyIndex] || '', (history[historyIndex] || '').length);
    } else if (key === 'ArrowDown') {
      historyIndex = Math.min(history.length, historyIndex + 1);
      const next = historyIndex === history.length ? historyDraft : history[historyIndex];
      setActiveText(next || '', (next || '').length);
    } else if (key === 'Home') {
      setActiveText(value, 0);
    } else if (key === 'End') {
      setActiveText(value, value.length);
    } else if (key.length === 1 && !key.match(/[\r\n]/)) {
      setActiveText(value.slice(0, position) + key + value.slice(position), position + key.length);
    }
  }

  function initialize(pageConfig, configuredSiteMap) {
    config = pageConfig;
    siteMap = configuredSiteMap;
    mount = document.querySelector(config.promptSelector || '#shell');
    if (!mount) throw new Error(`prompt mount not found: ${config.promptSelector || '#shell'}`);
    if (!siteMap || !siteMap.pages || !siteMap.directories || !siteMap.apps) {
      throw new Error('siteMap must define pages, directories, and apps');
    }
    siteRoot = new URL(config.siteRoot || './', document.baseURI);
    makePromptLine();
    document.addEventListener('keydown', event => {
      event.preventDefault();
      input(event.key);
    }, true);
  }

  global.NeuralHijackPrompt = {
    initialize,
    input,
    submit: submitActiveLine
  };

  if (global.pageConfig && global.siteMap) {
    initialize(global.pageConfig, global.siteMap);
  }
})(window);
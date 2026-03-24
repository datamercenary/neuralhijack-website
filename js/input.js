  var input_memory = [];
  var input_selector = 0;
  var sub_pages = ['math'];
  
  var commands = {"help": "display",
                  "ls": "display sub_pages",
                  "cd <sub_page>": "cd sub_page",
  };
  function submit(text) {
    //console.log(text);
    if (text === 'clear' || text === 'cls') {
      const shell = document.getElementById('shell');
    
      while (shell.lastChild && shell.lastChild !== shell.firstElementChild) {
       shell.removeChild(shell.firstChild);
      } 
    } else if (text === 'multiplication') {
      //console.log(text)
      window.location.replace('math/multiplication/facts.html');
    } else if (text === 'addition') {
      //console.log(text)
      window.location.replace('math/addition/facts.html');
    }
  };
  function add_shell_line() {
    const shell = document.getElementById('shell');
    if (shell.childElementCount > 0) {
      var cursor = shell.lastElementChild.lastElementChild;
    }
    else {
      var cursor = document.createElement('p');
      cursor.classList.add('cursor-line');
      cursor.appendChild(document.createElement('span'));
      cursor.lastElementChild.innerText = '__';
      cursor.lastElementChild.classList.add('hide');
      cursor.appendChild(document.createElement('span'));
      cursor.lastElementChild.classList.add('hide');
      cursor.lastElementChild.id = 'cursor-position';
      cursor.appendChild(document.createElement('span'));
      cursor.lastElementChild.innerHTML = "&#x2588;";
      cursor.lastElementChild.classList.add('blink');
    }
    ; 
    const newline = document.createElement('div');
    newline.classList.add("shell-line");
    //const prompt = shell.lastElementChild.firstElementChild.nextElementSibling;

    const textline = document.createElement('p');
    textline.appendChild(document.createElement('span'));
    textline.lastElementChild.innerText = '> ';
    textline.appendChild(document.createElement('span'));
    newline.appendChild(textline);
    //const curpos = document.getElementById('cursor-position');
    cursor.firstElementChild.nextElementSibling.innerText = '';
    newline.appendChild(cursor);
    shell.appendChild(newline);
    if (shell.childElementCount > 6) {
      shell.removeChild(shell.firstElementChild);
    };
    input_memory.push('');
    input_selector = input_memory.length - 1;
  };

  function input(k) {
    const shell = document.getElementById('shell');
    const activeline = shell.lastElementChild;
    const prompt = activeline.firstElementChild.firstElementChild.nextElementSibling;
    const cursor = activeline.lastElementChild;
    const curpos = cursor.firstElementChild.nextElementSibling;
    //console.log(k);
    if (k === "Backspace") {
      // Remove last character
      prompt.innerHTML = prompt.innerHTML.slice(0, curpos.innerHTML.length - 1) + prompt.innerHTML.slice(curpos.innerHTML.length, prompt.innerHTML.length);
      curpos.innerHTML = curpos.innerHTML.slice(0, -1);
      input_memory[input_memory.length - 1] = prompt.innerHTML;
    } else if (k === "Delete") {
      // Remove next character
      prompt.innerHTML = prompt.innerHTML.slice(0, curpos.innerHTML.length) + prompt.innerHTML.slice(curpos.innerHTML.length + 1, prompt.innerHTML.length);
      input_memory[input_memory.length - 1] = prompt.innerHTML;
    } else if (k === "Enter") {
      if (prompt.innerHTML.length > 0) {
        add_shell_line();
/*        const newline = document.createElement('p');
        newline.appendChild(document.createElement('span'));
        newline.lastElementChild.innerText = '> ';
        newline.appendChild(document.createElement('span'));
        newline.appendChild(cursor);
        shell.appendChild(newline); */
        if (shell.childElementCount > 6) {
          shell.removeChild(shell.firstChild);
        }
        submit(prompt.innerHTML);
      }
    } else if (k.length === 1) {
      // Regular printable characters (letters, numbers, symbols)
      //prompt.innerText += k;
      prompt.innerHTML = prompt.innerHTML.slice(0, curpos.innerHTML.length) + k + prompt.innerHTML.slice(curpos.innerHTML.length, prompt.innerHTML.length);
      curpos.innerHTML = curpos.innerHTML + '_';
      input_memory[input_memory.length - 1] = prompt.innerHTML;
    } else if (k === 'ArrowUp') {
      input_selector = Math.max(input_selector - 1, 0);
      //console.log(input_selector);
      prompt.innerHTML = input_memory[input_selector];
      curpos.innerHTML = '_'.repeat(prompt.innerHTML.length);
    } else if (k === 'ArrowDown') {
      input_selector = Math.min(input_selector + 1, input_memory.length - 1);
      //console.log(input_selector);
      prompt.innerHTML = input_memory[input_selector];
      curpos.innerHTML = '_'.repeat(prompt.innerHTML.length);
    } else if (k === 'ArrowLeft') {
      curpos.innerHTML = curpos.innerHTML.slice(0, Math.max(curpos.innerHTML.length-1, 0));
    } else if (k === 'ArrowRight') {
      if (curpos.innerHTML.length < prompt.innerHTML.length) {
      curpos.innerHTML = curpos.innerHTML + '_';
      }
    };
  };
/*$(document).ready(function () {
  $(document).on('keydown', input(e.key))
});
*/
add_shell_line();

$(document).ready(function () {
  $(document).on('keydown', function (e) { 
    input(e.key);
    e.preventDefault();
  });
});
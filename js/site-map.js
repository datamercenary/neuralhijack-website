/* Shared, site-relative navigation registry. App hrefs resolve from each page's configured siteRoot. */
window.siteMap = {
  homePage: 'home',
  pages: {
    home: {
      href: 'index.html',
      title: 'NeuralHijack home'
    },
    additionFacts: {
      href: 'math/addition/facts.html',
      title: 'Addition facts'
    },
    multiplicationFacts: {
      href: 'math/multiplication/facts.html',
      title: 'Multiplication facts'
    },
    normalPlot: {
      href: 'data/distributions/normal/plot.html',
      title: 'Normal distribution plot'
    },
    englishRain: {
      href: 'language/english/rain.html',
      title: 'Alphabet Rain'
    }
  },
  directories: {
    root: {
      parent: null,
      children: ['math', 'data', 'language']
    },
    math: {
      parent: 'root',
      children: ['math/addition', 'math/multiplication']
    },
    language: {
      parent: 'root',
      children: ['language/english']
    },
    'language/english': {
      parent: 'language',
      children: []
    },
    'math/addition': {
      parent: 'math',
      children: []
    },
    'math/multiplication': {
      parent: 'math',
      children: []
    },
    data: {
      parent: 'root',
      children: ['data/distributions']
    },
    'data/distributions': {
      parent: 'data',
      children: ['data/distributions/normal']
    },
    'data/distributions/normal': {
      parent: 'data/distributions',
      children: []
    }
  },
  apps: {
    additionFacts: {
      path: 'math/addition',
      parent: 'math/addition',
      pageId: 'additionFacts',
      href: 'math/addition/facts.html',
      args: ['--facts'],
      aliases: ['addition'],
      description: 'practice addition facts'
    },
    multiplicationFacts: {
      path: 'math/multiplication',
      parent: 'math/multiplication',
      pageId: 'multiplicationFacts',
      href: 'math/multiplication/facts.html',
      args: ['--facts'],
      aliases: ['multiplication'],
      description: 'practice multiplication facts'
    },
    normalPlot: {
      path: 'data/distributions/normal',
      parent: 'data/distributions/normal',
      pageId: 'normalPlot',
      href: 'data/distributions/normal/plot.html',
      args: ['--plot'],
      aliases: ['normal'],
      description: 'explore a normal-distribution histogram'
    },
    englishRain: {
      path: 'language/english',
      parent: 'language/english',
      pageId: 'englishRain',
      href: 'language/english/rain.html',
      args: ['--rain'],
      aliases: ['rain', 'english'],
      description: 'play the alphabet rain typing game'
    }
  }
};

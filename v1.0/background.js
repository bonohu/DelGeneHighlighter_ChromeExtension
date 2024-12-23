chrome.action.onClicked.addListener(async (tab) => {
    // CSVファイルを取得
    const response = await fetch(chrome.runtime.getURL("keywords.csv"));
    const csvText = await response.text();
    const keywords = parseCSV(csvText);
  
    // 現在のタブでスクリプトを実行
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: searchAndHighlight,  // 直接関数を定義する
      args: [keywords]  // キーワードを渡す
    });
  });
  
  function parseCSV(csvText) {
    return csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line !== "");
  }
  
  function searchAndHighlight(keywords) {
    const highlightStyle = 'background-color: aqua; font-weight: bold;';
    
    function walk(node) {
      if (node.nodeType === 3) { // テキストノード
        const parent = node.parentNode;
        const text = node.nodeValue;
        
        // 単語境界を考慮した正規表現
        const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        if (regex.test(text)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(regex, `<span style="${highlightStyle}">$1</span>`);
          parent.replaceChild(span, node);
        }
      } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          walk(node.childNodes[i]);
        }
      }
    }
    walk(document.body);
  }
  
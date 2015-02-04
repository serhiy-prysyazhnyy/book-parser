;var Application = 
(function(){
	var _currentBookParagraphs = [];
	var _currentBookTree = new PrefixTree();
	var _currentBookWordList = [];
	
	var _buildTreeForBook = function(){
		_currentBookTree.clear();
		for (var paragraphIndex in _currentBookParagraphs) {
			var paragraphText = _currentBookParagraphs[paragraphIndex];
			var re = new RegExp("[\\w\\'\\-]+", "g");
			var match = re.exec(paragraphText);
			while (match)
			{
				_currentBookTree.push(match[0], paragraphIndex, match.index);
				match = re.exec(paragraphText);
			}
		}
		_currentBookWordList = _currentBookTree.enumerateWords();

		_currentBookWordList.sort(function(a,b){
			var primVal = b.count - a.count;
			if (primVal != 0) return primVal;
			if (a.value < b.value) return -1;
			if (a.value > b.value) return 1;
			return 0;
		});
	};
	
	var _getOccurenceSnippet = function(wordValue, paragraphIndex, paragraphOffset){
		//'(' + paragraphOffset + ') ' + 
		var re = new RegExp(wordValue, "gi");
		return _currentBookParagraphs[paragraphIndex].replace(re, '<b>$&</b>');
	}

	return {
		parseBook: function(bookContent){
			var xmlParser = new DOMParser();
			xmlDoc = xmlParser.parseFromString(bookContent, "text/xml");
			
			var paragraphNodes = xmlDoc.getElementsByTagName("p");
			var strParagraphs = [];
			
			var i = 0, node;
			while (node = paragraphNodes[i++]) {
				strParagraphs.push(node.childNodes[0].nodeValue);
			}
			
			//console.log(strParagraphs);
			_currentBookParagraphs = strParagraphs;
			_buildTreeForBook();
		},
		showWordList: function(){
			var wordListBody = $('#wordList');
			wordListBody.empty();
			for (var i in _currentBookWordList)
			{
				var wordEntryRow =
					$('<li class="list-group-item" data-word-val="' +
					_currentBookWordList[i].value + 
					'"><span class="badge">' + 
					_currentBookWordList[i].count + 
					'</span>' + 
					_currentBookWordList[i].value + 
					'<a href="http://www.merriam-webster.com/dictionary/' +
					_currentBookWordList[i].value + 
					'" target="_blank" style="margin-left: 41px;">translate</a></li>');
				//$('<tr><td>' + i + '</td><td>' + _currentBookWordList[i].value + '</td><td>' + _currentBookWordList[i].count + '</td></tr>');
				wordListBody.append(wordEntryRow);
			}
			$('#distinctWordsCnt').text(_currentBookWordList.length);
		},
		showHideOccurencesList: function($elem){
			var nextNode = $elem.next();
			if (!nextNode || !nextNode.attr('data-occs'))
			{
				var nextNodeHtml = '<li class="list-group-item" style="display: none;" data-occs="filled">';
				nextNodeHtml += '<table class="table table-striped table-bordered table-hover"><tbody>';

				var wordValue = $elem.attr('data-word-val');
				
				var positions = _currentBookTree.enumerateWordPositions(wordValue);
				
				for (var i in positions){
					if (i > 41) break;
					var position = positions[i];
					nextNodeHtml += '<tr><td>' + _getOccurenceSnippet(wordValue, position.paragraphIndex, position.paragraphOffset) + '</td></tr>';
				}
				
				nextNodeHtml += '</tbody></table></li>';
				
				nextNode = $(nextNodeHtml);
				nextNode.insertAfter($elem);
			}
			nextNode.slideToggle();
		}
	};
})();

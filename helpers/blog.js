// for our excerpt this helper method will trim our text
// in a correct way and not cutting words in half without
// putting three dots e.g  happpy would end by hap...

// str is the text inputted
// length is how much we want to include
// delimiter is
// appendix is what we want to use on the end.

exports.smartTrim = (str, length, delim, appendix) => {
  if (str.length <= length) return str;

  var trimmedStr = str.substr(0, length + delim.length);

  var lastDelimIndex = trimmedStr.lastIndexOf(delim);
  if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

  if (trimmedStr) trimmedStr += appendix;
  return trimmedStr;
};

// smartTrim(body, 320, ' ', ' ...')

// body = <p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p>

// goes to output
//<p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog one</p><p>Content of blog...

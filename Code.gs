// URL of the RSS feed to parse
var RSS_FEED_URL = "https://android-developers.googleblog.com/atom.xml";

// Webhook URL of the Hangouts Chat room
var WEBHOOK_URL = "YOUR_WEBHOOK_URL";

// When DEBUG is set to true, the topic is not actually posted to the room
var DEBUG = false;

function fetchNews() {
  
  var lastUpdate = new Date(parseFloat(PropertiesService.getScriptProperties().getProperty("lastUpdate")) || 0);
  
  Logger.log("Fetching '" + RSS_FEED_URL + "'...");
  
  var xml = UrlFetchApp.fetch(RSS_FEED_URL).getContentText();
  var document = XmlService.parse(xml);
  
  var atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  
  Logger.log("Last update: " + lastUpdate);
  
  var items = document.getRootElement().getChildren('entry', atom).reverse();
  
  Logger.log(items.length + " entrie(s) found");
  
  var count = 0;
  
  for (var i = 0; i < items.length; i++) {
    
    var pubDate = new Date(items[i].getChild('published', atom).getAllContent());
    
    var title = items[i].getChild('title', atom).getText();
    var link = items[i].getChildren('link', atom)[2].getAttribute('href').getValue();
    
    if(DEBUG){
      Logger.log("------ " + (i+1) + "/" + items.length + " ------");
      Logger.log(pubDate);
      Logger.log(title);
      Logger.log(link);
      // Logger.log(description);
      Logger.log("--------------------");
    }

    if(pubDate.getTime() > lastUpdate.getTime()) {
      Logger.log("Posting topic '"+ title +"'...");
      if(!DEBUG){
        postTopic_(title, link);
      
        PropertiesService.getScriptProperties().setProperty("lastUpdate", pubDate.getTime());
      }
      
      count++;
    }
  }
  
  Logger.log("> " + count + " new(s) posted");
}

function postTopic_(title, link) {
  
  var text = "*" + title + "*" + "\n";
  
  text += link;
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({
      "text": text 
    })
  };
  
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}

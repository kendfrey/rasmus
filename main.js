"use strict";

(async () =>
{

const Rss = require("./rss");
const rss = new Rss(1);
await rss.load("feeds.json");
rss.on("item", onItem);

function onItem(item)
{
	console.log(item);
}

})();

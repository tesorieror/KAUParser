/**
 * Index JS
 */

var _ = require('underscore');
var q = require('q');

var p = require('./parser');
var c = require('./common');
var db = require('/Users/ricardo.tesoriero/GitRepo/db.iras/db.iras/db');

p.instance.parseDicts()//
.then(p.instance.parseCategories)//
.then(c.log("after parseCategories", false), c.error("after parseCategories"))//
.then(p.instance.parseTags)//
.then(c.log("after parseTags", false), c.error("after parseTags"))//
.then(p.instance.parseIndicators)//
.then(c.log("after parseIndicators", false), c.error("after parseIndicators"))//
.then(db.instance.close)//
.then(c.log("after db.instance.close", false),
		c.error("after db.instance.close"))//
.done();

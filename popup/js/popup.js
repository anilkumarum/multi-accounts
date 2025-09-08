import "./reset.js";
import "./bug-collect.js";
import "../components/helper/atom-icon.js";
import "../components/helper/alert-box.js";
import "../components/toolbar/top-bar.js";
import "../components/multi-accounts.js";
import { reportSite } from "./util.js";
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss);

const reportSiteBtn = eId("reportSite");
$on(reportSiteBtn, "click", reportSite);

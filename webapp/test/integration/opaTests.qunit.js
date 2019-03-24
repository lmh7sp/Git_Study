/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"team/template/Git_Study/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";
	return BaseController.extend("sap.ui.study.git.controller.routingEx.RoutingEvent", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			this._messageValue = "First Match";
			oRouter.getRoute("routingEvent").attachBeforeMatched(this._onBeforeMatched, this);
			oRouter.getRoute("routingEvent").attachMatched(this._onMatched, this);
			// oRouter.getRoute("studyPage").attachPatternMatched(this._onPatternMatched, this);
		},
		_onBeforeMatched: function(){
			this._messageValue = "this is Before Matched message";
		},
		_onMatched: function(){
			sap.m.MessageToast.show(this._messageValue);
		},
		// _onPatternMatched: function(){
		// 	sap.m.MessageToast.show("patternMatched");
		// }
	});

});
sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.layout.ResponsiveSplitterExample", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		
		onInit: function () {
		// 	var oRouter = this.getRouter();
		// 	oRouter.getRoute("responsiveSplitterExample").attachBeforeMatched(this._onBeforeMatched, this);
		// 	oRouter.getRoute("responsiveSplitterExample").attachMatched(this._onRouteMatched, this);
		// 	oRouter.getRoute("responsiveSplitterExample").attachPatternMatched(this._onPatternMatched, this);
		// },
		// _onBeforeMatched: function(){
		// 	// this._messageValue = "this is Before Matched";
		// },
		// _onPatternMatched: function(){
		// 	sap.m.MessageToast.show(this._messageValue);
		// },
		// _onRouteMatched: function(){
		// 	this._messageValue = "yoyo";
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		//	onExit: function() {
		//
		//	}

	});

});
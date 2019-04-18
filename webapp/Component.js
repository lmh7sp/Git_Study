sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.study.git.Component", {

		metadata: [
			{manifest: "json"}
		],
		init: function () {
			// call the init function of the parent
			var targetModel = this.getModel("targetModel");
			sap.ui.getCore().setModel(targetModel,"targetModel");
			var routeModel = this.getModel("routeModel");
			sap.ui.getCore().setModel(routeModel,"routeModel");
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			// this.getModel("targetModel"); //여기서 model은 아직 load가 안된 상태이다.
			this.getRouter().initialize();

		}

	});

});

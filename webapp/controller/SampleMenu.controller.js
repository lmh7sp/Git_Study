sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.SampleMenu", {
		onPressButton: function(event){
			var oBtn = event.getSource().getCustomData()[0];
			if(oBtn && oBtn.getKey() == "goBtn")
				this.getRouter().navTo(oBtn.getValue());
			
		}
	});

});

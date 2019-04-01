sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.study.git.controller.Home", {

		onNavToEmployees : function () {
			this.getRouter().navTo("employeeList");
		}

	});

});

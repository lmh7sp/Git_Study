sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function (BaseController,Filter,MessageToast ) {
	"use strict";
	return BaseController.extend("sap.ui.study.git.controller.routingEx.RoutePara", {
		onInit: function () {
			var oDefualtModel,oMyModel;
			var oRouter = this.getRouter();	
			oDefualtModel = this.getOwnerComponent().getModel();
			oMyModel = this.getOwnerComponent().getModel("myBindingElementModel");
			oRouter.getRoute("routePara").attachMatched(this._onMatched, this);
			try{
				oDefualtModel.read("/Employees",{//?$filter=FirstName%20eq%20%27" + oArgs.firstname + "%27",{
					success: function(oData,sRespond){
						oMyModel.setData(oData);
					},
					error: function(sRespond){
						MessageToast.show(sRespond);
				}});
			} catch(e){MessageToast.show(e);}
		},
		_onMatched : function (oEvent) {
			var oArgs, Form, oModel;
			oModel = this.getOwnerComponent().getModel("myBindingElementModel");

			oArgs = oEvent.getParameter("arguments");
			Form = this.getView().byId("Form");
			Form.setModel(oModel,"myModel");
			Form.bindElement("myModel>/results/"+oArgs.employeeNum);
		},
		navBack: function(){
			var oRouter = this.getRouter();
			oRouter.myNavBack("routeWithPara");
		}
	});

});
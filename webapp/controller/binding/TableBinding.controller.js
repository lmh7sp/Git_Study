sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/core/Item"
], function (BaseController,Filter, Item) {
	"use strict";
	var _Filter = [];	
	return BaseController.extend("sap.ui.study.git.controller.binding.TableBinding", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.ui.study.git.table.view.Table_example
		 */
		onInit: function () {
			var oView = this.getView();
			var oCombo =oView.byId("myCombo");
			var oModel, aItem=[], oItem;

			oItem = new Item({text:"--선택--", key:"noValue"});
			oCombo.addItem(oItem);
			oModel = this.getOwnerComponent().getModel();
			
			oModel.read("/Employees",{
				success: function(oData,sRespond){
					var i;
					for(i in oData.results){
						if(!aItem[oData.results[i].City]){
							oItem = new Item({text:oData.results[i].City, key:oData.results[i].City});
							aItem[oData.results[i].City] = 1;
							oCombo.addItem(oItem);
						}
					}
				},
				error: function(sRespond){
			}});
			oCombo.setSelectedKey("noValue");
		},
		onSearch: function(event,sPath){
			var aFilters = [],
				sQuery = event.getSource().getValue(),
				oTable = this.byId("tableExample"),
				oBinding, i;
			if(_Filter[sPath]){
				// _Filter[sPath].destroy();
				_Filter[sPath] = null;
			}
			
			if(sPath == "City" && sQuery == "--선택--") sQuery ="";
			
			if (sQuery && sQuery.length > 0) {
				_Filter[sPath] = new Filter(sPath, sap.ui.model.FilterOperator.Contains, sQuery);
			}
			for(i in _Filter){
				if(_Filter[i]){
					aFilters.push(_Filter[i]);
				}
			}
			oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
			
		},
		onPressTableItem: function(event){
			var oItem = event.getParameters().listItem;
			var oENum = oItem.getCustomData()[0].getValue();//.getParent().indexOfItem(oItem);
			this.getRouter().navTo("routePara", {
				employeeNum : String(Number(oENum)-1)
			});
		}
	});

});
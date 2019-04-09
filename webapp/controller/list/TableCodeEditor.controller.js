sap.ui.define([
	"sap/ui/study/git/controller/BaseController"
], function (BaseController) {
	"use strict";
	var oEditor;
	var sView = null;
	var sController = null;

	return BaseController.extend("sap.ui.study.git.controller.list.TableCodeEditor", {

		onInit: function () {
			oEditor = this.byId("codeEditor");
			oEditor.setValue('// select tabs to see value of CodeEditor changing');
			// var oPreView = this.getView()//.getParent().byId("detailHeader").getPreviousPage();
			// if(oPreView){
			// 	sView = $(oPreView);
			// 	sController = $(oPreView.getController);
			// } else{
			// 	this.getRouter().navTo("samplePage");
			// }
			sView= '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout"\n' +
					'controllerName="sap.ui.study.git.controller.list.TableExample" xmlns:html="http://www.w3.org/1999/xhtml">\n' +
					'<l:VerticalLayout width="100%">\n' +
					'<l:content>\n' +
					'<l:HorizontalLayout>\n' +
					'<l:content>\n' +
					'<l:VerticalLayout>\n' +
					'<l:content>\n' +
					'<Label text="{i18n>EmployeesLastName}"></Label>\n' +
					'<SearchField liveChange="onSearch" placeholder="{i18n>EmployeesLastName}">\n' +
					'<customData>\n' +
					'<core:CustomData value="LastName"></core:CustomData>\n' +
					'</customData>\n' +
					'</SearchField>\n' +
					'</l:content>\n' +	
					'</l:VerticalLayout>\n' +
					'<l:VerticalLayout>\n' +
					'<l:content>\n' +
					'<Label text="{i18n>EmployeesFirstName}"></Label>\n' +
					'<SearchField liveChange="onSearch" placeholder="{i18n>EmployeesFirstName}">\n' +
					'<customData>\n' +
					'<core:CustomData value="FirstName"></core:CustomData>\n' +
					'</customData>\n' +
					'</SearchField>\n' +
					'</l:content>\n' +	
					'</l:VerticalLayout>\n' +
					'<l:VerticalLayout>\n' +
					'<l:content>\n' +
					'<Label text="{i18n>EmployeesCity}"></Label>\n' +
					'<SearchField liveChange="onSearch" placeholder="{i18n>EmployeesCity}">\n' +
					'<customData>\n' +
					'<core:CustomData value="City"></core:CustomData>\n' +
					'</customData>\n' +
					'</SearchField>\n' +
					'</l:content>\n' +	
					'</l:VerticalLayout>\n' +
					'<l:VerticalLayout>\n' +
					'<l:content>\n' +
					'<Label text="{i18n>EmployeesHomePhone}"></Label>\n' +
					'<SearchField liveChange="onSearch" placeholder="{i18n>EmployeesHomePhone}">\n' +
					'<customData>\n' +
					'<core:CustomData value="HomePhone"></core:CustomData>\n' +
					'</customData>\n' +
					'</SearchField>\n' +
					'</l:content>\n' +	
					'</l:VerticalLayout>\n' +
					'</l:content>\n' +
					'</l:HorizontalLayout>\n' +
					'<l:HorizontalLayout>\n' +
					'<l:content>\n' +
					'<Table id="tableExample" headerText="{i18n>ListOfAllEmployees}" items="{/Employees}">\n' +
					'<columns>\n' +
					'<Column>\n' +
					'<Text text="{i18n>EmployeesLastName}" />\n' +
					'</Column>\n' +
					'<Column>\n' +
					'<Text text="{i18n>EmployeesFirstName}" />\n' +
					'</Column>\n' +
					'<Column>\n' +
					'<Text text="{i18n>EmployeesCity}" />\n' +
					'</Column>\n' +
					'<Column>\n' +
					'<Text text="{i18n>EmployeesHomePhone}" />\n' +
					'</Column>\n' +
					'</columns>\n' +
					'<items>\n' +
					'<ColumnListItem>\n' +
					'<cells>\n' +
					'<Text\n' +
					'text="{LastName}" />\n' +
					'<Text\n' +
					'text="{FirstName}" />\n' +
					'<Text\n' +
					'text="{City}" />\n' +
					'<Text\n' +
					'text="{HomePhone}" />\n' +
					'</cells>\n' +
					'</ColumnListItem>\n' +
					'</items>\n' +
					'</Table>\n' +
					'</l:content>\n' +
					'</l:HorizontalLayout>\n' +
					'</l:content>\n' +
					'</l:VerticalLayout>\n' +
					'</mvc:View>;\n' ;
			sController='sap.ui.define([\n' +
						'"sap/ui/study/git/controller/BaseController",\n' +
						'"sap/ui/model/Filter"\n' +
						'], function (BaseController,Filter) {\n' +
						'"use strict";\n' +
					
						'return BaseController.extend("sap.ui.study.git.controller.list.TableExample", {\n' +
						'onInit: function () {\n' +
				
						'},\n' +
						'onSearch: function(event){\n' + +
						'var aFilters = [],\n' +
						'sQuery = event.getSource().getValue(),\n' +
						'sPath = event.getSource().getCustomData()[0].getValue(),\n' +
						'oFilter,\n' +
						'oTable = this.byId("tableExample"),\n' +
						'oBinding;\n' +
						'if (sQuery && sQuery.length > 0) {\n' +
						'oFilter = new Filter(sPath, sap.ui.model.FilterOperator.Contains, sQuery);\n' +
						'aFilters.push(oFilter);\n' +
						'}\n' +
			
						'oBinding = oTable.getBinding("items");\n' +
						'oBinding.filter(aFilters, "Application");\n' +
						'}\n' +
						'});\n' +
					
						'});\n';
		},
		onSelectCode: function (oEvent) {
			var sFilterId = oEvent.getParameter("selectedKey");

			switch (sFilterId) {
				case "A":
					oEditor.setValue(sView);
					oEditor.setType("xml");
					oEditor.prettyPrint();
					break;
				case "B":
					oEditor.setValue(sController);
					oEditor.setType("javascript");
					oEditor.prettyPrint();
					break;
			}
		}

	});

});


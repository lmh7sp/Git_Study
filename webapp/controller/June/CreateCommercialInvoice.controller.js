sap.ui.define([
	"sap/ui/study/git/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Filter, MessageToast) {
	"use strict";
	var flgNewAndUpDate = true;
	var NUMBER_RANAGE_CODE = "SD01",
		NUMBER_RANAGE_CODEGROUP = "NUMB",
		COMMON_CODEGROUP="S001",
		SOLDPARTY_CODE = "A001",
		SHIPPARTY_CODE = "A002",
		COUNTRYASSY_CODE = "A003",
		COUNTRYFAB_CODE = "A004";
	return Controller.extend("sap.ui.study.git.controller.June.CreateCommercialInvoice", {

		onInit: function () {
			var oView = this.getView();
			this._setViewModel(oView);
			this._attachRoutMatched(oView);
			
		},
		_attachRoutMatched : function(oView){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateCommercialInvoice").attachMatched(function (oEvent) {
				var oArgs = oEvent.getParameter("arguments");
				if(oArgs.LayoutOption === "Display"){
					flgNewAndUpDate = true;
				}else{
					flgNewAndUpDate = false;
				}
				if(oArgs.List){
					this._getDeliveryData(JSON.parse(oArgs.List), oArgs.SoldToParty, oArgs.ShipToParty);
				}
				
				this._setLayout(oView);
			}.bind(this), this);
		},
		_setViewModel : function(oView){
			oView.setModel(new JSONModel(this._getDefualtHader()), "HeaderJson");
			
			oView.setModel(new JSONModel([]), "CreateItemList");
			oView.setModel(new JSONModel({
				CreateItemListCnt : 0
			}), "layout");
		},
		_getDeliveryData : function(aDeliveryArr, sSoldToParty, sShipToParty){
			if(flgNewAndUpDate){
				this._setDesplaySetting(aDeliveryArr);
			}else{
				this._setCreateDataSetting(aDeliveryArr, sSoldToParty, sShipToParty);
			}
		},
		_setDesplaySetting : function(aDeliveryArr){
			var oView = this.getView(),
				oJsonModel = oView.getModel("CreateItemList"),
				oLayoutModel = oView.getModel("layout"),
				oHeaderJson = oView.getModel("HeaderJson"),
				oSalesOrderModel = oView.getModel("SalesOrder"),
				oPage = oView.byId("CIDetail");
			var aFilter = [];
			aFilter.push(new Filter("EXCINO", "EQ", aDeliveryArr[0]));
			
			oPage.setBusy(true);
			oJsonModel.setProperty("/", []);
			oLayoutModel.setProperty("/CreateItemListCnt", 0);
			
			var aResults = [];
			var aSalesOrderFilter = [],
				aSalesOrderDummyFilter = [],
				aItemArr = [];
			if(aResults.length){
				aItemArr = aResults[0]["to_COMMERCIAL_INVOICE_ITEM"].results;
				oHeaderJson.setProperty("/", aResults[0]);
				var aSalesOrderDummyFilter = aItemArr.map(function(item){
					return new Filter({
						filters : [
							new Filter("SalesOrder", "EQ", item.SalesOrder),
							new Filter("SalesOrderItem", "EQ", item.SalesOrderItem)
						],
						and : true
					});
				});
				
				aSalesOrderFilter.push(new Filter({
					filters : [
						new Filter({ filters : aSalesOrderDummyFilter, and : false }),
						new Filter("ConditionType", "EQ", "ZMP1")
					],
					and : true
				}));
			}else{
				oPage.setBusy(false);
			}
			if(aItemArr.length){
				this._getODataRead(oSalesOrderModel, "/A_SalesOrderItemPrElement", aSalesOrderFilter).done(function(aSalseOrderItem){
					var oSalseOrderObj = aSalseOrderItem.reduce(function(total, row){
						var sKey =row.SalesOrder + "_" + row.SalesOrderItem;
						if(!total[sKey]){
							total[sKey] = [];
						}
						total[sKey].push(row);
						return total;
					}, {});
					
					oJsonModel.setProperty("/", aItemArr.map(function(item){
						var sKey = item.SalesOrder + "_" + item.SalesOrderItem,
							iUnitPrice = "0";
						if(oSalseOrderObj[sKey]){
							iUnitPrice = oSalseOrderObj[sKey][0].ConditionRateValue;
						}
						item.MaskingPrice = Number(iUnitPrice).toFixed(2);
						item.MaskingAmount = ( Number(item.Qty) * Number(iUnitPrice) ).toFixed(2);
						
						if(aResults[0].MaskingPriceUseFlag === "Y"){
							item.MPPrice = item.MaskingPrice;
							item.MPAmount = item.MaskingAmount;
						}else{
							item.MPPrice = item.UnitPrice;
							item.MPAmount = item.Amount;
						}
						return item;
					}));
					oLayoutModel.setProperty("/CreateItemListCnt", aItemArr.length);
					
					oPage.setBusy(false);
				});
			}else{
				oPage.setBusy(false);
			}
		},
		_callUpDateNumberRange : function(sUUID, sCINumber){
			var oView = this.getView(),
				oCodeListModel = oView.getModel("CodeList"),
				oData = {};
				
			oData.CodeValue3 = 	(Number(sCINumber) + 1).toString();
			this._getODataUpdate(oCodeListModel, "/YY1_COMMON_CODEBOOK_LIST(guid'" + sUUID + "')", oData);
		},
		_setCreateDataSetting : function(aDeliveryArr, sSoldToParty, sShipToParty){
			var oView = this.getView(),
				oPage = oView.byId("CIDetail"),
				oModel = oView.getModel("OutboundDelivery"),
				oBPModel = oView.getModel("BusinessPartner"),
				oItemModel = oView.getModel("CreateItemList"),
				oLayoutModel = oView.getModel("layout"),
				oSalesOrderModel = oView.getModel("SalesOrder"),
				oCodeListModel = oView.getModel("CodeList"),
				oHeaderJson = oView.getModel("HeaderJson");
			var aFilter = aDeliveryArr.map(function(sDeliveryDoc){
				return new Filter("DeliveryDocument", "EQ", sDeliveryDoc);
			});
			var aBPFilter = [],
				aCodeListFilter = [],
				aCommonCodeListFilter = [],
				aSalesOrderFilter = [];
			aBPFilter.push(new Filter({
				filters : [
					new Filter("BusinessPartner", "EQ", sSoldToParty),
					new Filter("BusinessPartner", "EQ", sShipToParty)
				], and : false
			}));
			
			aCodeListFilter.push(new Filter({
				filters : [
					new Filter("Code", "EQ", NUMBER_RANAGE_CODE),
					new Filter("CodeGroup", "EQ", NUMBER_RANAGE_CODEGROUP)
				], and : true
			}));
			aCommonCodeListFilter.push(new Filter({
				filters : [
					new Filter("CodeGroup", "EQ", COMMON_CODEGROUP),
					new Filter({
						filters : [
							new Filter("Code", "EQ", SOLDPARTY_CODE),
							new Filter("Code", "EQ", SHIPPARTY_CODE),
							new Filter("Code", "EQ", COUNTRYASSY_CODE),
							new Filter("Code", "EQ", COUNTRYFAB_CODE)
						], and : false
					})
				], 
				and : true 
			}));
			
			oPage.setBusy(true);
			oLayoutModel.setProperty("CreateItemListCnt", 0);
			$.when(
				this._getODataRead(oModel, "/A_OutbDeliveryHeader", aFilter,{
					"$expand" : "to_DeliveryDocumentItem"
				}),
				this._getODataRead(oBPModel, "/A_BusinessPartnerAddress", aBPFilter),
				this._getODataRead(oBPModel, "/A_BusinessPartner", aBPFilter),
				this._getODataRead(oCodeListModel, "/YY1_COMMON_CODEBOOK_LIST", aCodeListFilter),
				this._getODataRead(oCodeListModel, "/YY1_COMMON_CODEBOOK_LIST", aCommonCodeListFilter),
				this._getODataRead(oSalesOrderModel, "/A_SalesOrderItemPrElement", aSalesOrderFilter)
			).done(function(aResults, aBPAddressArr, aBPArr, aNumberRange, aBaseData){
				var aItemArr = [],
					oFirstRow = aResults[0],
					oHeaderObj = this._getDefualtHader();
				var iCIItemNum = 1;
				if(aNumberRange[0]){
					oHeaderObj.EXCINO = aNumberRange[0].CodeValue3;
					if(aNumberRange[0].CodeValue2 === aNumberRange[0].CodeValue3){
						MessageToast.show("CommerialInvoice Number has been exceeded.\nPlease contact this system admin.");
					}
					this._callUpDateNumberRange(aNumberRange[0].SAP_UUID, aNumberRange[0].CodeValue3);
				}
				var oAdressObj = aBPAddressArr.reduce(function(total, item){
						var sKey = item.BusinessPartner;
						if(!total[sKey]){
							total[sKey] = [];
						}
						total[sKey].push(item);
						return total;
				},{});
				var oBPObj = aBPArr.reduce(function(total, item){
						var sKey = item.BusinessPartner;
						if(!total[sKey]){
							total[sKey] = [];
						}
						total[sKey].push(item);
						return total;
				},{});
				var oBaseData = aBaseData.reduce(function(total, item){
						var sKey = item.Code;
						if(!total[sKey]){
							total[sKey] = [];
						}
						total[sKey].push(item);
						return total;
				},{});
				
				var oSoldPartyCode = {},
					oShipPartyCode = {},
					oCountryAssyCode = {},
					oCountryFABCode = {};

				if(oBaseData[SOLDPARTY_CODE]){
					oSoldPartyCode = oBaseData[SOLDPARTY_CODE][0];
				}
				if(oBaseData[SHIPPARTY_CODE]){
					oShipPartyCode = oBaseData[SHIPPARTY_CODE][0];
				}
				if(oBaseData[COUNTRYASSY_CODE]){
					oCountryAssyCode = oBaseData[COUNTRYASSY_CODE][0];
				}
				if(oBaseData[COUNTRYFAB_CODE]){
					oCountryFABCode = oBaseData[COUNTRYFAB_CODE][0];
				}
				
				if(!$.isEmptyObject(oSoldPartyCode)){
					oHeaderObj.SoldByLine01 = oSoldPartyCode.CodeValue1;
					oHeaderObj.SoldByLine02 = oSoldPartyCode.CodeValue2;
					oHeaderObj.SoldByLine03 = oSoldPartyCode.CodeValue3;
					oHeaderObj.SoldByLine04 = oSoldPartyCode.CodeValue4;
				}
				if(!$.isEmptyObject(oShipPartyCode)){
					oHeaderObj.ShipFromLine01 = oShipPartyCode.CodeValue1;
					oHeaderObj.ShipFromLine02 = oShipPartyCode.CodeValue2;
					oHeaderObj.ShipFromLine03 = oShipPartyCode.CodeValue3;
					oHeaderObj.ShipFromLine04 = oShipPartyCode.CodeValue4;
				}
				if(!$.isEmptyObject(oCountryAssyCode)){
					// oHeaderObj.CountryofAssy = oCountryAssyCode.CodeValue1;
					oHeaderObj.CountryofAssyDescription = oCountryAssyCode.CodeValue1;
				}
				if(!$.isEmptyObject(oCountryFABCode)){
					// oHeaderObj.CountryofFAB = oCountryFABCode.CodeValue1;
					oHeaderObj.CountryofFABDescription = oCountryFABCode.CodeValue1;
				}
				if(sSoldToParty && oBPObj[sSoldToParty]){
					oHeaderObj.SoldToParty = sSoldToParty;
					oHeaderObj.SoldToPartyName = oBPObj[sSoldToParty][0].BusinessPartnerName.substr(0, 40);
				}
				if(sShipToParty && oBPObj[sShipToParty]){
					oHeaderObj.ShipToParty = sShipToParty;
					oHeaderObj.ShipToPartyName = oBPObj[sShipToParty][0].BusinessPartnerName.substr(0, 40);
				}
				
				if(oFirstRow){
					oHeaderObj.DeliveryDocument = aDeliveryArr.join(", ");
					oHeaderObj.PlannedGoodsIssueDate = oFirstRow.PlannedGoodsIssueDate;
					oHeaderObj.ActualGoodsIssueDate = oFirstRow.ActualGoodsMovementDate;
					// oHeaderObj.ReferenceSDDocument = oFirstRow.ReferenceSDDocument;
					oHeaderObj.Incoterms = oFirstRow.IncotermsClassification;  
					oHeaderObj["Incoterms_Location"] = oFirstRow.IncotermsTransferLocation;
					oHeaderObj.Currency = oFirstRow.TransactionCurrency;
					oHeaderObj.TotalGrossWeight = oFirstRow.HeaderGrossWeight;
					oHeaderObj.TotalNetWeight = oFirstRow.HeaderNetWeight;
					
					
					var oBPSoldParty = oAdressObj[sSoldToParty][0],
						oBPShipParty = oAdressObj[sShipToParty][0];
						
					oHeaderObj.BillToLine01 = oBPSoldParty.FullName;
					oHeaderObj.BillToLine02 = oBPSoldParty.HouseNumber +" "+ oBPSoldParty.StreetName +" "+ oBPSoldParty.StreetPrefixName +" "+ oBPSoldParty.AdditionalStreetPrefixName;
					oHeaderObj.BillToLine03 = oBPSoldParty.CityName +" "+ oBPSoldParty.PostalCode;			// CityName + PostalCode
					oHeaderObj.BillToLine04 = oBPSoldParty.Region +" "+ oBPSoldParty.Country;				// Region + Country
					oHeaderObj.ShipToLine01 = oBPShipParty.FullName;
					oHeaderObj.ShipToLine02 = oBPShipParty.HouseNumber +" "+ oBPShipParty.StreetName +" "+ oBPShipParty.StreetPrefixName +" "+ oBPShipParty.AdditionalStreetPrefixName;
					oHeaderObj.ShipToLine03 = oBPShipParty.CityName +" "+ oBPShipParty.PostalCode;			// CityName + PostalCode
					oHeaderObj.ShipToLine04 = oBPShipParty.Region +" "+ oBPShipParty.Country;				// Region + Country
				
				
				}
				var iTotalQty = 0,
					iGrandTotal = 0,
					aCustomerPO = [];
				var aSalesOrderFilter = [],
					aSODummyFiler = [];	
				aResults.forEach(function(row){
					var oItem = row.to_DeliveryDocumentItem;
					aCustomerPO.push(row.YY1_H_CUSTPO_DLH);
					if(oItem.results){
						oItem.results.forEach(function(item){
							var obj = {};
							
							obj.CommercialInvoice = oHeaderObj.EXCINO;
							obj.CommercialInvoiceItem = iCIItemNum.toString();
							obj.OutboundDelivery = item.DeliveryDocument;
							obj.OutboundDeliveryItem = Number(item.DeliveryDocumentItem).toString();
							
							obj.SalesOrder = item.ReferenceSDDocument;
							obj.SalesOrderItem = Number(item.ReferenceSDDocumentItem).toString();
							obj.MKTPartNumberCode = item.Material;
							
							obj.CustomerPartNumber = item.MaterialByCustomer;
							obj.CustomerPartDescription = item.YY1_MaterialDescriptio_DLI.trim();
							
							obj.CommodityCode = item.YY1_HSCode1_DLI.trim();
							obj.CustomsDescription = item.YY1_HSCODEDESC1_DLI.trim();
							obj.ECCNCode = item.YY1_ECCNCode1_DLI.trim();
							obj.LicTypeLicenseNo = item.YY1_LICENSETYPENO1_DLI.trim();
							
							obj.Qty = item.ActualDeliveryQuantity;
							obj.UoM = item.BaseUnit;
							obj.UnitPrice = item.YY1_NetPriceAmount1_DLI.trim();
							obj.Amount = item.YY1_NetAmount1_DLI.trim();
							
							aItemArr.push(obj);
							iCIItemNum++;
							iTotalQty = Number( ( iTotalQty + Number(item.ActualDeliveryQuantity) ).toFixed(2) );
							iGrandTotal = Number( ( iGrandTotal + Number(item.YY1_NetAmount1_DLI) ).toFixed(2) );
							
							aSODummyFiler.push(new Filter({
								filters : [
									new Filter("SalesOrder", "EQ", item.ReferenceSDDocument),
									new Filter("SalesOrderItem", "EQ", item.ReferenceSDDocumentItem)
								],
								and : true
							}));
						});
					}
				});
				
				aSalesOrderFilter.push(new Filter({
					filters : [
						new Filter({ filters : aSODummyFiler, and : false }),
						new Filter("ConditionType", "EQ", "ZMP1")
					],
					and : true
				}));
				
				this._getODataRead(oSalesOrderModel, "/A_SalesOrderItemPrElement", aSalesOrderFilter).done(function(aSalseOrderItem){
					var oSalseOrderObj = aSalseOrderItem.reduce(function(total, row){
							var sKey =row.SalesOrder + "_" + row.SalesOrderItem;
							if(!total[sKey]){
								total[sKey] = [];
							}
							total[sKey].push(row);
							return total;
						}, {});

					oHeaderObj.CustomerPO = aCustomerPO.join(", ");
					if(aItemArr.length){
						oHeaderObj.HTCCode = aItemArr[0].YY1_HSCode1_DLI;
						// oHeaderObj.HTCCodeDescription = aItemArr[0].YY1_HSCODEDESC1_DLI;
						oHeaderObj.TotalQty = iTotalQty;
						oHeaderObj.GrandTotal = iGrandTotal;
					}
					oHeaderJson.setProperty("/", oHeaderObj);
					oItemModel.setProperty("/", aItemArr.map(function(item){
						var sKey = item.SalesOrder + "_" + item.SalesOrderItem,
							iMaskingPrice = "0";
						
						if(oSalseOrderObj[sKey]){
							iMaskingPrice = oSalseOrderObj[sKey][0].ConditionRateValue;
						}
						
						item.MaskingPrice =  Number(iMaskingPrice).toFixed(2);
						item.MaskingAmount = ( Number(item.Qty) * Number(iMaskingPrice) ).toFixed(2);
						
						item.MPPrice = item.UnitPrice;
						item.MPAmount = item.Amount;
						
						return item;
					}));
					oLayoutModel.setProperty("/CreateItemListCnt", aItemArr.length);
					oPage.setBusy(false);
				}.bind(this));
			}.bind(this));
		},
		_getDefualtHader : function(){
			return {
				MaskingPriceUseFlag : "N",
				EXCINO :  "",
				DeliveryDocument : "",
				SoldToParty : "",
				SoldToPartyName : "",
				ShipToParty : "",
				ShipToPartyName : "",
				PlannedGoodsIssueDate : "",
				ActualGoodsIssueDate : "",
				ReferenceSDDocument : "",
				CustomerPO : "",
				DocumentDate : new Date(),
				"Shipment_No" : "",
				Carrier : "",
				WAYBILL : "SkyHigh Memory",
				Incoterms : "",
				"Incoterms_Location" : "",
				Currency : "",
				SoldByLine01 : "",
				SoldByLine02 : "",
				SoldByLine03 : "",
				SoldByLine04 : "",
				ShipFromLine01 : "",
				ShipFromLine02 : "",
				ShipFromLine03 : "",
				ShipFromLine04 : "",
				BillToLine01 : "",
				BillToLine02 : "",
				BillToLine03 : "",
				BillToLine04 : "",
				ShipToLine01 : "",
				ShipToLine02 : "",
				ShipToLine03 : "",
				ShipToLine04 : "",
				TotalQty : "",
				TotalCarton : "0",
				GrandTotal : "",
				TotalGrossWeight : "",
				TotalNetWeight : "",
				HTCCode : "",
				HTCCodeDescription : "",
				CountryofAssy : "",
				CountryofAssyDescription : "",
				CountryofFAB : "",
				CountryofFABDescription : "",
				RemarkText01 : "",
				RemarkText02 : "",
				BottomText : 
				"These items are by the H.K. Government and authorized for export only to the country of ultimate destination for use by the ultimate consignee or end-user(s)\n"
				+"They may not be resold, transferred, or otherwise disposed of, toany othrt country or to any person other than the authorized ultimater consignee or end-user(s),\n" 
				+"either in incorporated into other items, without first obtaining approval from the H.K. government or as otherwise authorized by H.K. law and regulatioins."
			};
		},
		_setLayout : function(oView){
			var oPage = oView.byId("CIDetail");
			var flgBtnVisible = true,
				sShowFormFragment = "ReadCI";
				
			if(!flgNewAndUpDate){
				flgBtnVisible = false;
				sShowFormFragment = "CreateCI";
				oPage.setShowNavButton(false);
			}else{
				oPage.setShowNavButton(true);
			}
			
			this._showFormFragment(sShowFormFragment);
			oView.setModel(new JSONModel({
				Visible : flgBtnVisible
			}),"BtnLayout");
		},
		_formFragments : {},
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.study.git.fragment." + sFragmentName,this);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("CIDetail");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},
		onEditCI : function(){
			var oView = this.getView(),
				oLayoutModel = oView.getModel("BtnLayout"),
				flgBtnVisible = oLayoutModel.getProperty("/Visible");
				
			if(flgBtnVisible){
				this._showFormFragment("CreateCI");
			}else{
				this._showFormFragment("ReadCI");
			}
			oLayoutModel.setProperty("/Visible", !flgBtnVisible);
		},
		//////////////////////////////////////////////////////////////
		formatterPrice : function(sUnit, sMasking, sMaskingPriceUseFlag){
			if(sMaskingPriceUseFlag === "Y"){
				return sMasking;
			}else{
				return sUnit;
			}
			
		},
		formatterAmount : function(sAmount, sMasking, sMaskingPriceUseFlag){
			if(sMaskingPriceUseFlag === "Y"){
				return sMasking;
			}else{
				return sAmount;
			}
		},
		onSelectedChangeMP : function(oEvent){
			var oView = this.getView(),
				oSeletedItem = oEvent.getParameter("selectedItem"),
				sKey = oSeletedItem.getKey(),
				oHeaderModel = oView.getModel("HeaderJson"),
				oItemModel = oView.getModel("CreateItemList"),
				aItemArr = oItemModel.getProperty("/"),
				sGrandTotal = 0;
			
			oItemModel.setProperty("/", aItemArr.map(function(item){
				var sCostValue = "";
				if(sKey === "Y"){
					sCostValue = item.MaskingAmount;
					item.MPPrice = item.MaskingPrice;
					item.MPAmount = item.MaskingAmount; 
				}else{
					sCostValue = item.Amount;
					item.MPPrice = item.UnitPrice;
					item.MPAmount = item.Amount; 
				}
				sGrandTotal = Number( ( sGrandTotal + Number(sCostValue) ).toFixed(2) );
				
				return item;
			}));
			oHeaderModel.setProperty("/GrandTotal", sGrandTotal);
		},
		//////////////////////////////////////////////////////////////
		onPrint : function(){
			var url = sap.ui.require.toUrl("ZSD004/SkyHighZSD004/html/CommercialInvoice.html");
			var oView = this.getView(),
				oHeaderJsonModel = oView.getModel("HeaderJson"),
				oItemJsonModel = oView.getModel("CreateItemList");
				
			var oRowData = this._copyObj(oHeaderJsonModel.getProperty("/")),
				aItemArr = this._copyObj(oItemJsonModel.getProperty("/"));
 			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM-dd-YYYY" });   
			oRowData.DocumentDate = dateFormat.format(oRowData.DocumentDate);
			
			window._getHeader = oRowData;
			window._getItem = aItemArr;
			window.open(url, "_blink");
		},
		onCommercialInvoice : function(){
			if(flgNewAndUpDate){
				this._updateCommercialInvoice();
			}else{
				this._createCommercialInvoice();
			}
		},
		_updateCommercialInvoice : function(){
			var oView = this.getView(),
				oModel = oView.getModel("CommercialInvoice"),
				oItemModel = oView.getModel("CreateItemList"),
				oHeaderJson = oView.getModel("HeaderJson"),
				oHeaderData = oHeaderJson.getProperty("/"),
				aItemData = oItemModel.getProperty("/"),
				sUUID = oHeaderData.SAP_UUID;
			var aCallItemArr = [];
			oHeaderData.GrandTotal = oHeaderData.GrandTotal.toString();
			oHeaderData.TotalQty = oHeaderData.TotalQty.toString();
			
			aItemData.forEach(function(item){
				var sItemUUID = item.SAP_UUID;
				delete item.to_COMMERCIAL_INVOICE;
				delete item.__metadata;
				delete item.SAP_PARENT_UUID;
				delete item.SAP_UUID;
				
				delete item.MaskingPrice;
				delete item.MaskingAmount;
				delete item.MPPrice;
				delete item.MPAmount;
				
				aItemData.push(this._getODataUpdate(oModel, "/YY1_COMMERCIAL_INVOICE_ITEM_CO(guid'" + sItemUUID + "')", item));
			}.bind(this));
			
			delete oHeaderData.SAP_CreatedByUser;
			delete oHeaderData.SAP_CreatedByUser_Text;
			delete oHeaderData.SAP_CreatedDateTime;
			delete oHeaderData.SAP_LastChangedByUser;
			delete oHeaderData.SAP_LastChangedByUser_Text;
			delete oHeaderData.SAP_LastChangedDateTime;
			delete oHeaderData.SAP_UUID;
			delete oHeaderData.to_SAPSysAdminDataChangeUser;
			delete oHeaderData.to_SAPSysAdminDataCreateUser;
			delete oHeaderData.__metadata;
			delete oHeaderData.to_COMMERCIAL_INVOICE_ITEM;
			
			
			this._getODataUpdate(oModel, "/YY1_COMMERCIAL_INVOICE(guid'" + sUUID + "')", oHeaderData).done(function(aReturn){
				$.when.apply($, aItemData).done(function(aItemReturn){
					MessageToast.show("Save Success");
					this.onCancle();
				}.bind(this));
			}.bind(this));
		},
		_createCommercialInvoice : function(){
			var oView = this.getView(),
				oModel = oView.getModel("CommercialInvoice"),
				oItemModel = oView.getModel("CreateItemList"),
				oHeaderJson = oView.getModel("HeaderJson"),
				oHeaderData = oHeaderJson.getProperty("/"),
				aItemData = oItemModel.getProperty("/");
			
			oHeaderData.GrandTotal = oHeaderData.GrandTotal.toString();
			oHeaderData.TotalQty = oHeaderData.TotalQty.toString();
			oHeaderData["to_COMMERCIAL_INVOICE_ITEM"] = {results : aItemData.map(function(item){
				delete item.MaskingPrice;
				delete item.MaskingAmount;
				delete item.MPPrice;
				delete item.MPAmount;
				return item; 
			})};
			
			this._getODataCreate(oModel, "/YY1_COMMERCIAL_INVOICE", oHeaderData).done(function(aReturn){
				MessageToast.show("Save Success");
				this.onViewPage();
			}.bind(this));
		},
		onCancle : function(){
			var oView = this.getView(),
				oLayoutModel = oView.getModel("BtnLayout"),
				oHeaderJson = oView.getModel("HeaderJson"),
				sEXCINO = oHeaderJson.getProperty("/EXCINO"),
				flgBtnVisible = oLayoutModel.getProperty("/Visible");
			if(!flgNewAndUpDate){
				this.onViewPage();
			}else{
				if(flgBtnVisible){
					this._showFormFragment("CreateCI");
				}else{
					this._showFormFragment("ReadCI");
					this._setDesplaySetting([sEXCINO]);
				}
				oLayoutModel.setProperty("/Visible", !flgBtnVisible);
			}
		},
		onViewPage : function(){
			 var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("View");
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZSD004.SkyHighZSD004.view.CreateCommercialInvoice
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZSD004.SkyHighZSD004.view.CreateCommercialInvoice
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZSD004.SkyHighZSD004.view.CreateCommercialInvoice
		 */
		//	onExit: function() {
		//
		//	}

	});

});
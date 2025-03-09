import { LightningElement, wire,track,api } from 'lwc';
import getRestaurantMenu from
'@salesforce/apex/AccountApexClass.RestaurentMenu';
import createOrderRecordDetail from
'@salesforce/apex/AccountApexClass.createOrderRecordDetail';
import orderDetails from '@salesforce/apex/AccountApexClass.orderDetails';
import My_BIRYANI from '@salesforce/resourceUrl/raviFood';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const columns = [
{ label: 'Table', fieldName: 'Table__c',initialWidth: 80},
{
label: 'Order Status',
fieldName: 'Order_Status__c',
type: 'text',
initialWidth: 90,
cellAttributes: {
style: 'color: black',
class: { fieldName: 'orderStatusClass' }
}
},
{ label: 'Amount', fieldName: 'Price__c',initialWidth: 80},
{
label: 'Payment',
fieldName: 'Payment_status__c',
initialWidth: 80,
type: 'text',
cellAttributes: {
style: 'color: black',
class: { fieldName: 'paymentStatusClass' }
}
},
{
label: 'Edit',
type: 'button-icon',
initialWidth: 50,
typeAttributes: {
iconName: 'action:edit',
name: 'edit', // Action name for handleRowAction
title: 'Edit', // Tooltip text
alternativeText: 'Edit'
}
},
{
label: 'View',
type: 'button-icon',
initialWidth: 50,
typeAttributes: {
iconName: 'action:preview',
name: 'view', // Action name for handleRowAction
title: 'View', // Tooltip text
variant: 'border-filled',
alternativeText: 'View'
}
},
{
label: 'Add',
type: 'button-icon',
initialWidth: 50,
typeAttributes: {
iconName: 'utility:add',
name: 'addItem', // Action name for handleRowAction
title: 'Add Item', // Tooltip text
variant: 'success',
alternativeText: 'Add'
}
}
/* {
type: 'button', typeAttributes: {
label: 'Add Item', name: 'addItem', variant: 'success'
}
}*/
];
export default class Restaurant extends LightningElement {
progressData=[];
@track recrdId='';
data=[];
drinks = [];
vegFriedRice = [];
otherItems = [];
selectedItems = [];
homeItems=[];
@track isPrinting = false;
initialData=[];
@track activeTab;
@track tableValue;
@track payvalue;
@track ordervalue;
@track isPaid='Not Paid';
@track searchName;
columns = columns;
@track searchBillVal;
food=My_BIRYANI;
get tableoptions() {
return [
{ label: 'Parcel', value: 'Parcel' },
{ label: '1', value: '1' },
{ label: '2', value: '2' },
{ label: '3', value: '3' },
{ label: '4', value: '4' },
{ label: '5', value: '5' },
{ label: '6', value: '6' },
{ label: '7', value: '7' },
{ label: '8', value: '8' },
{ label: '9', value: '9' },
{ label: '10', value: '10' },
];
}
get paymentoptions() {
return [
{ label: 'Paid', value: 'Paid' },
{ label: 'Pending', value: 'Pending' },
{ label: 'Partially Paid', value: 'Partially Paid' },
];
}
get orderoptions() {
return [
{ label: 'New', value: 'New' },
{ label: 'In Progress', value: 'In Progress' },
{ label: 'Delivered', value: 'Delivered' },
];
}
handleTableChange(event) {
this.tableValue = event.detail.value;
}
handlePaymentChange(event) {
this.payvalue = event.detail.value;
}
orderStatusChange(event) {
this.ordervalue = event.detail.value;
}
changePay(event){
this.isPaid= event.target.checked?'Paid':'Not Paid';
}
@wire(getRestaurantMenu)
wiredRestaurantMenu({ error, data }) {
if (data) {
this.initialData=data
this.categorizeItems(data);
} else if (error) {
console.error('Error retrieving restaurant menu: ', error);
}
}
handleCheck(event){
const selectedItemId = event.target.value;
var isChecked = event.target.checked;
const item = this.drinks.find(item => item.Id === selectedItemId) ||
this.vegFriedRice.find(item => item.Id ===
selectedItemId) ||
this.otherItems.find(item => item.Id === selectedItemId);
if (item) {
if (isChecked) {
// If the item is being checked, add it to the selectedItems list
this.addItemToSelectedItems(item);
} else {
// If the item is being unchecked, remove it from the
selectedItems list
this.removeItemFromSelectedItems(item.Id);
}
}
}
removeItemFromSelectedItems(itemId) {
// Remove the item from the selectedItems array
this.selectedItems = this.selectedItems.filter(item => item.id !==
itemId);
const item = [...this.drinks, ...this.vegFriedRice,
...this.otherItems].find(item => item.Id === itemId);
if (item) {
item.isCheck = false;
}
}
addItemToSelectedItems(item) {
// Check if the item is already selected
const existingItem = this.selectedItems.find(selected => selected.id
=== item.Id);
if (existingItem) {
// Item already exists, increase quantity
existingItem.quantity += 1;
existingItem.totalPrice = existingItem.quantity *
existingItem.price;
} else {
// New item selected, add to the list
this.selectedItems = [
...this.selectedItems,
{
id: item.Id,
name: item.item_Name__c,
price: item.Price__c,
quantity: 1,
sum: item.Price__c,
decreaseDisable: true,
label:item.Label,
isCheck: true,
}
];
}
}
get totalBill() {
return this.selectedItems.reduce((total, item) => total + item.sum,
0);
}
increaseQuantity(event) {
const itemId = event.target.getAttribute('data-id');
const item = this.selectedItems.find(selected => selected.id ===
itemId);
if (item) {
item.quantity += 1;
item.sum = item.quantity * item.price;
item.decreaseDisable = item.quantity <= 1;
this.selectedItems = [...this.selectedItems];
}
}
decreaseQuantity(event) {
const itemId = event.target.getAttribute('data-id');
const item = this.selectedItems.find(selected => selected.id ===
itemId);
if (item) {
item.quantity -= 1;
item.sum = item.quantity * item.price;
item.decreaseDisable = item.quantity <= 1;
this.selectedItems = [...this.selectedItems]; // Trigger
reactivity
}
}
/*get decreaseDisable() {
const item = this.selectedItems.find(selected => selected.quantity ===
1);
return item ? item.quantity <= 1 : false;
}*/
deleteItem(event) {
const itemId = event.target.getAttribute('data-id');
// Remove the item from the selectedItems list
this.selectedItems = this.selectedItems.filter(selected => selected.id !==
itemId);
this.drinks = this.drinks.map(item =>
item.Id === itemId ? { ...item, isCheck: false } : item
);
this.vegFriedRice = this.vegFriedRice.map(item =>
item.Id === itemId ? { ...item, isCheck: false } : item
);
this.otherItems = this.otherItems.map(item =>
item.Id === itemId ? { ...item, isCheck: false } : item
);
}
categorizeItems(items) {
// Separate items into categories based on label__c
this.drinks = items.filter(item => item.Label === 'Drinks');
this.vegFriedRice = items.filter(item => item.Label === 'Veg Fried
Rice');
this.otherItems = items.filter(item => item.Label !== 'Drinks' &&
item.Label !== 'Veg Fried Rice');
}
generatePrint() {
this.isPrinting = true;
setTimeout(function(){ window.print()}, 1000);
this.isPrinting = false;
}
Searching(event) {
this.searchName = event.target.value;
//console.log('name>>'+this.searchName);
if (this.searchName) {
this.activeTab='home';
this.homeItems = this.initialData.filter(item =>
item.item_Name__c &&
item.item_Name__c.toLowerCase().includes(this.searchName.toLowerCase())
);
//console.log('tab>>'+this.activeTab);
} else {
// Reset to all items if search input is cleared
this.homeItems = [];
this.activeTab='';
}
}
createOrderRec(event){
const itemsList = this.selectedItems.map(item => JSON.stringify(item));
if(!this.tableValue){
this.showToast('Error', 'Error', 'Please fill Table');
return;
}else{
this.tableValue=this.tableValue;
// alert('>>>'+this.tableValue);
}
console.log('itemsList>>'+itemsList);
createOrderRecordDetail({
selectedItems: itemsList,
totalBill:
this.totalBill,table:this.tableValue,payStatus:this.isPaid,orderStatus:this.or
dervalue,recordId:this.recrdId
})
.then(result => {
this.showToast('Success', 'Success', 'Record has been saved
successfully!');
})
.catch(error => {
this.showToast('Error', 'Error', 'Please check Details.');
});
//this.getTableData();
setTimeout(() => {
window.location.reload();
}, 1000);
}
SearchBillNumber(event){
this.searchBillVal=event.detail.value;
if(this.searchBillVal){
this.progressData = this.data.filter(item =>
(item.Table__c && item.Table__c.includes(this.searchBillVal))
);
}else{
this.getTableData();
}
}
get todayCounter(){
let todayCounter = 0;
this.data.forEach(item => {
if (item.Price__c && item.Payment_status__c=='Paid' &&
item.is_Report_Sent__c==false) {
todayCounter += item.Price__c;
}
});
return todayCounter;
}
connectedCallback() {
this.getTableData();
}
getTableData(){
orderDetails().then(result => {
this.data = result;
/* this.data = result.map(row => ({
...row,
orderStatusClass:
this.getOrderStatusClass(row.Order_Status__c),
paymentStatusClass:
this.getPaymentStatusClass(row.Payment_status__c)
}));*/
this.progressData = [];
this.CleardData = [];
result.forEach(currentItem => {
// Get the style classes based on Order_Status and Payment_status
currentItem.orderStatusClass =
this.getOrderStatusClass(currentItem.Order_Status__c);
currentItem.paymentStatusClass =
this.getPaymentStatusClass(currentItem.Payment_status__c);
// Check if Order_Status is 'Delivered' and Payment_status is
'Paid'
if (currentItem.Order_Status__c === 'Delivered' &&
currentItem.Payment_status__c === 'Paid') {
if (this.CleardData.length < 12) {
this.CleardData.push(currentItem);
}
} else {
// Push the record to progressData only if it's not in the
'Delivered' and 'Paid' status
if (this.progressData.length < 12) {
this.progressData.push(currentItem);
// alert('Progress');
}
}
});
this.progressData.sort((a, b) => {
// Assuming you want to sort by a date field (e.g., 'CreatedDate' or
'Date__c')
return new Date(a.CreatedDate) - new Date(b.CreatedDate); // Sort in
descending order
});
this.CleardData.sort((a, b) => {
// Assuming you want to sort by a date field (e.g., 'CreatedDate' or
'Date__c')
return new Date(b.CreatedDate) - new Date(a.CreatedDate); // Sort in
descending order
});
})
.catch(error => {
console.error('Error creating order:', error);
// Handle error response, if needed
});
}
getOrderStatusClass(status) {
switch (status) {
case 'Delivered':
return 'slds-theme_success';
case 'New':
return 'slds-badge_inverse';
case 'In Progress':
return 'slds-theme_warning';
default:
return '';
}
}
getPaymentStatusClass(status) {
switch (status) {
case 'Paid':
return 'slds-theme_success';
case 'Not Paid':
return 'slds-theme_warning';
default:
return '';
}
}
// Handle row actions
@api editRecordId;
@track isEditModalOpen;
@track viewRecordId;
@track isViewModalOpen;
handleRowAction(event) {
const actionName = event.detail.action.name;
const row = event.detail.row;
//alert('actionName>>'+actionName);
switch (actionName) {
case 'edit':
this.editRecordId = row.Id;
this.isEditModalOpen = true;
break;
case 'view':
this.viewRecordId = row.Id;
this.isViewModalOpen = true;
break;
case 'addItem':
this.handleAddItem(row);
// alert('table>>'+row.Table__c);
break;
}
}
closeModal() {
this.isViewModalOpen = false;
this.isEditModalOpen = false;
}
handleAddItem(recId){
this.recrdId=recId.Id;
this.tableValue=recId.Table__c;
this.activeTab='Drinks';
//console.log('rec>>'+this.recrdId);
// alert('rec>>'+recId.Table__c);
}
handleSaveSuccess(event) {
const recordId = event.detail.id; // Get the record ID from the event
this.showToast('success', 'Updated', 'The record has been Updated.');
this.isEditModalOpen = false;
this.getTableData();
// Handle additional actions like redirecting or showing success
messages
}
showToast(variant, title, message) {
const event = new ShowToastEvent({
title: title,
message: message,
variant: variant
});
this.dispatchEvent(event);
}
}
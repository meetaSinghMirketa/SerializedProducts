// serializedProductList.js
import { LightningElement, track } from 'lwc';
import getOrderItemsWithProductsByOrderId from '@salesforce/apex/SerializedProductController.getOrderItemsWithProductsByOrderId';
import submitSelectedProducts from '@salesforce/apex/SerializedProductController.submitSelectedProducts'; // Apex method to create records

export default class SerializedProductList extends LightningElement {
    @track orderItemsWithProducts = [];
    orderId = '';

    handleOrderIdChange(event) {
        this.orderId = event.target.value;
    }

    handleFetchOrderItems() {
        if (this.orderId) {
            getOrderItemsWithProductsByOrderId({ orderId: this.orderId })
                .then(data => {
                    this.orderItemsWithProducts = data.map(wrapper => {
                        return {
                            ...wrapper,
                            selectedProducts: []
                        };
                    });
                })
                .catch(error => {
                    console.error('Error fetching order items: ', error);
                });
        
            }
    }

    handleCheckboxChange(event) {
        const productId = event.target.dataset.productId;
        const orderId = event.target.dataset.orderId;
        const isChecked = event.target.checked;
        const orderItemWrapper = this.orderItemsWithProducts.find(item => item.orderItem.Id === orderId);

        if (isChecked) {
            if (orderItemWrapper.selectedProducts.length < orderItemWrapper.orderItem.Quantity) {
                orderItemWrapper.selectedProducts.push(productId);
            } else {
                event.preventDefault();
            }
        } else {
            orderItemWrapper.selectedProducts = orderItemWrapper.selectedProducts.filter(id => id !== productId);
        }
    }

    handleSubmit() {

        const selectedProductData = this.orderItemsWithProducts.map(wrapper => ({
            orderItemId: wrapper.orderItem.Id,
            selectedProductIds: wrapper.selectedProducts
        }));

        alert('input ---'+JSON.stringify(selectedProductData)); 

        submitSelectedProducts({ selectedProductData })
            .then(() => {
                // Handle success (e.g., show a success message, refresh data, etc.)
                console.log('Records created successfully');
            })
            .catch(error => {
                // Handle error (e.g., show an error message)
                console.error('Error creating records: ', error);
            });
    }
}

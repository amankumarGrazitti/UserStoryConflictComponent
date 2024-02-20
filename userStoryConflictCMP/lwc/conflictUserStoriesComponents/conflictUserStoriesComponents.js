import { LightningElement, api, wire, track } from 'lwc';
import getComponentRecordList from '@salesforce/apex/ConflictUserStoriesComponents.getComponentRecord';
import getSprintRecordList from '@salesforce/apex/ConflictUserStoriesComponents.getSprintRecord';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ConflictUserStoriesComponents extends NavigationMixin(LightningElement) {

    @track componentWithUserStoryName =[];
    record_URL;
    @track picklistOrdered =[];
    @track searchResults=[];
    @track selectedSearchResult;
    @track searchData = false;
    @track pageNumber = 1;
    @track recordsPerPage = 10;
    @track totalRecords;
    @track selectedSprint = '';
    @track count;

    connectedCallback() {
        // Add click listener to close dropdown when clicking outside
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        document.addEventListener('click', this.handleOutsideClick);
    }

    disconnectedCallback() {
        // Remove the event listener when the component is destroyed
        document.removeEventListener('click', this.handleOutsideClick);
    }
    handleOutsideClick(event) {
        // Determine if the click occurred outside the dropdown
        if (this.searchData && !this.template.contains(event.target)) {
            this.searchData = false; // Close the dropdown
        }
    }
    stopPropagation(event) {
        event.stopPropagation();
    }
    
    @wire(getComponentRecordList, { sprintId : '$selectedSprint', pageNumber: '$pageNumber', recordsPerPage: '$recordsPerPage' })
    wiredComponents({ error, data }) {
        if (data) {
            console.log('this__total_',data.totalRecords);
            console.log('this__recs_',JSON.stringify(data.records));
            if(data.records.length >0){
                this.totalRecords = data.totalRecords;
                this.componentWithUserStoryName = data.records;
            }else{        
                this.componentWithUserStoryName = null;    
                const event = new ShowToastEvent({
                title: 'Warning',
                message: 'There are no components in this sprint.',
                variant: 'warning',
                });
                this.dispatchEvent(event);
            }

        }else if (error) {
            // Handle error
            console.log('nullll111');
        }else{
            console.log('nullll222');
            this.componentWithUserStoryName = null;
        }
    }


    get isFirstPage() {
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber >= Math.ceil(this.totalRecords / this.recordsPerPage);
    }

    handlePrevious() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
        }
    }

    handleNext() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
        }
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.recordsPerPage);
    }




    get selectedValue() {        
        return this.selectedSearchResult ? this.selectedSearchResult.label : null;
    }
    handleClear(event) {
    if (!event.target.value.length) {
        console.log('clear');
        this.componentWithUserStoryName = null; 
        //this.searchData = false;

    }
}
    search(event) {
        console.log('search term- ',event.detail.value.toLowerCase());
        this.searchData = true;
        
            const input = event.detail.value.toLowerCase();
            console.log('This message is shown after a 3-second delay.',input);
            getSprintRecordList({
            sprintName : input, 
            })
            .then(result => {
                    if(result.length > 0){
                        console.log('result2++ ',JSON.stringify(result));
                        let searchTerm = [];
                        for(let i=0; i<result.length; i++) {
                            console.log('resultID++ ',result[i].Id);
                            console.log('resultName++ ',result[i].Name);
                            searchTerm = [...searchTerm ,{value: result[i].Id , label: result[i].Name}]; 
                            this.searchResults = searchTerm;
                            console.log('result8555++ ',this.searchResults);
                            this.searchData = true;
                        } 
                    }else{
                        this.searchResults = ''; 
                        this.searchData = false;
                    }
                    console.log('result8777777++ ',JSON.stringify(this.searchResults));
                })
                .catch(error => {
                    console.log(error);
                    this.error = error;
                    this.dispatchEvent(event);
                });

        console.log('result87++ ',JSON.stringify(this.searchResults));
    }
    
    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        console.log('selectedValue__ ',selectedValue);
        console.log('this.searchResults+++__+_ ',this.searchResults);
        this.selectedSearchResult = this.searchResults.find(
        (searchResults) => searchResults.value === selectedValue
        );
        this.clearSearchResults();
        this.selectedSprint = selectedValue;
        
    }

    clearSearchResults() {
        //this.searchResults = null;
        this.searchData = false;
        //this.componentWithUserStoryName = null; 
    }

    showPicklistOptions() {
        //this.searchData = true;
        if(this.selectedSearchResult){
            this.searchData = false;
        }
        
    }
    

    getRecordView(event){
        this.record_URL = window.location.origin+ '/lightning/r/copado__User_Story__c/'+event.currentTarget.dataset.value+'/view';
        window.open(this.record_URL, '_blank').focus();
    } 
}
import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import { CatalogDetail, CircularDetails, EnquiryDetail, PODetail } from '../model';
import { CircularServiceService } from '../circular-service.service';
import * as fileSaver from 'file-saver';
import { HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';

let circularData: CircularDetails[] ;
let catalogData: CatalogDetail[] ;
let enquiryData: EnquiryDetail[];
let poData: PODetail[];

@Component({
  selector: 'app-search-data',
  templateUrl: './search-data.component.html',
  styleUrls: ['./search-data.component.css']
})

export class SearchDataComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  isAdmin = false;
  username;
  dataSource = new MatTableDataSource();
  dataSource1;
  dataSource2;
  dataSource3;
  showPagination = false;
  displayedColumnsCircular: string[] = [ 'id', 'circularDetail', 'circularNumber', 'date', 'departmant', 'fileName' , 'download'];
  displayedColumnsCatalog: string[] = [ 'productName', 'modelNo', 'oldModelNo', 'voltage', 'range', 'colour', 'fileName' , 'download'];
  displayedColumnsEnquiry: string[] = [ 'enquiryNumber', 'companyName', 'personName', 'mobile', 'place', 'date', 'itemDescription', 'make', 'status', 'remark', 'fileName' , 'download'];
  displayedColumnsPo: string[] = [ 'orderNo', 'item', 'make', 'modelNo', 'quantity', 'rate', 'remark', 'date', 'itemCode', 'customer', 'fileName' , 'download'];
  //dataSource = new MatTableDataSource<CircularDetails>();
  submitted = false;
  f;
  selection = new SelectionModel<CircularDetails>(true, []);
  searchValue;
  showTable = false;
  showHeader = false;
  showSearch = false;
  showCatalogTable = false;
  showEnquiryTable = false;
  showPurchaseOrderTable = false;
  type;
  noResultsMsg = false;

  typeList = ['' , 'Circular', 'Catalog' , 'Enquiry' , 'Purchase Order'];


  constructor(private router: Router, private circularService: CircularServiceService) { }

  ngOnInit() {
    console.log('in search component');
    console.log(this.router.url);
    this.isAdmin = this.circularService.isAdmin;
    this.username = this.circularService.currentUser.firstName + ' ' + this.circularService.currentUser.lastName;
    if(this.isAdmin){
        this.displayedColumnsCircular.push('edit');
        this.displayedColumnsCatalog.push('edit');
        this.displayedColumnsEnquiry.push('edit');
        this.displayedColumnsPo.push('edit');
    }
    if (this.router.url === '/search') {
       this.showHeader = true;
    } else {
      this.showHeader = false;
    }
  }

  search() {
    console.log('In search method');
    console.log(this.searchValue);
    if (this.searchValue !== '' && this.searchValue !== undefined ) {
      if (this.type === 'Catalog') {
        this.searchCatalog();
      } else if (this.type === 'Enquiry') {
        this.searchEnquiry();
      } else if (this.type === 'Purchase Order') {
        this.searchPo();
      } else if (this.type === 'Circular') {
        this.searchCircular();
      }
  } else {
     this.showTable = false;
     this.showCatalogTable = false;
     this.showEnquiryTable = false;
     this.showPurchaseOrderTable = false;
     this.showPagination = false;
  }
  }

  searchCircular() {
    const clientName = this.circularService.clientName;
    this.circularService.searchByKey(clientName, this.searchValue).subscribe((result) => {
      console.log(result);
      circularData = result;
      if (circularData.length !== 0 ) {
          this.dataSource = new MatTableDataSource(result);
          this.showTable = true;
          this.noResultsMsg = false;
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
          this.showPagination = true;
      } else {
        this.noResultsMsg = true;
        this.showTable = false;
        this.showPagination = false;
      }
   });
  }

  searchCatalog() {
    this.circularService.searchByKeyForCatalog(this.searchValue).subscribe((result) => {
      console.log(result);
      catalogData = result;
      if (catalogData.length !== 0 ) {
          this.dataSource1 = new MatTableDataSource(result);
          this.dataSource1.paginator = this.paginator;
          this.paginator.firstPage();
          this.showCatalogTable = true;
          this.noResultsMsg = false;
          this.showPagination = true;
      } else {
        this.noResultsMsg = true;
        this.showCatalogTable = false;
        this.showPagination = false;
      }
   });
  }

  searchEnquiry() {
    this.circularService.searchByKeyForEnquiry(this.searchValue).subscribe((result) => {
      console.log(result);
      enquiryData = result;
      if (enquiryData.length !== 0 ) {
          this.dataSource2 = new MatTableDataSource(result);
          this.dataSource2.paginator = this.paginator;
          this.paginator.firstPage();
          this.showEnquiryTable = true;
          this.noResultsMsg = false;
          this.showPagination = true;
      } else {
        this.noResultsMsg = true;
        this.showEnquiryTable = false;
        this.showPagination = false;
      }
   });
  }

  searchPo() {
    this.circularService.searchByKeyForPo(this.searchValue).subscribe((result) => {
      console.log(result);
      poData = result;
      if (poData.length !== 0 ) {
        this.dataSource3 = new MatTableDataSource(result);
        this.dataSource3.paginator = this.paginator;
        this.paginator.firstPage();
        this.noResultsMsg = false;
        this.showPurchaseOrderTable = true;
        this.showPagination = true;
      } else {
        this.noResultsMsg = true;
        this.showPurchaseOrderTable = false;
        this.showPagination = false;
      }
   });
  }

  download(row) {
     console.log('in download function');
     console.log(row);
     const clientName = this.circularService.clientName;
     this.circularService.fileDownload(clientName, row.fileName).subscribe(response => {
     const blob: any = new Blob([response], { type: 'text/json; charset=utf-8' });
     const url = window.URL.createObjectURL(blob);
     // window.open(url);
    // window.location.href = response.url;
     fileSaver.saveAs(blob, row.fileName);
    }), error => console.log('Error downloading the file' + error),
                 () => console.info('File downloaded successfully');
  }

  edit(row) {
    console.log(row);
    if (this.type === 'Circular') {
      this.circularService.editRow  = row;
      this.router.navigate(['admin/upload', 'editCircular']);
    } else if (this.type === 'Catalog') {
      this.circularService.editCatalogRow  = row;
      this.router.navigate(['admin/catalog', 'editCatalog']);
    } else if (this.type === 'Enquiry') {
      this.circularService.editEnquiryRow  = row;
      this.router.navigate(['admin/enquiry', 'editEnquiry']);
    } else if (this.type === 'Purchase Order') {
      this.circularService.editPoRow  = row;
      this.router.navigate(['admin/poUpload', 'editPo']);
    }
  }

  typeSelected(e) {
    console.log(e.target.value);
    this.searchValue = '';
    this.noResultsMsg = false;
    console.log(this.type);
    if (this.type === null || this.type === undefined || this.type === '') {
      this.showSearch = false;
      this.showTable = false;
      this.showCatalogTable = false;
      this.showEnquiryTable = false;
      this.showPurchaseOrderTable = false;
      this.showPagination = false;
    } else {
      this.showSearch = true;
      this.showTable = false;
      this.showCatalogTable = false;
      this.showEnquiryTable = false;
      this.showPurchaseOrderTable = false;
      this.showPagination = false;
    }

  }

}

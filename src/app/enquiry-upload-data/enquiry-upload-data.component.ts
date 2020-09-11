import { Component, OnInit } from '@angular/core';

import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUpload,EnquiryDetail } from '../model';
import { CircularServiceService } from '../circular-service.service';

@Component({
  selector: 'app-enquiry-upload-data',
  templateUrl: './enquiry-upload-data.component.html',
  styleUrls: ['./enquiry-upload-data.component.css']
})
export class EnquiryUploadDataComponent implements OnInit {

  constructor(private router: Router, private formBuilder: FormBuilder, private circularService: CircularServiceService,
    private route: ActivatedRoute) { }

    enquiryFormGroup: FormGroup;
    submitted = false;
    public currentFileUpload: File;
    public selectedFiles: FileList;
    enquiryDetail : EnquiryDetail;
    fileId;
    uploadFileObj: FileUpload;
    duplicateCheck = false;
    progress = false;
    fileCheck = false;
    dateCheck = false;


    ngOnInit() {
      this.enquiryFormGroup = this.formBuilder.group({
        companyName: ['', Validators.required],
        personName: ['', Validators.required],
        mobile: ['', Validators.required],
        place: ['', [Validators.required ]],
        enquiryNumber : ['', [Validators.required]],
        date  : ['', [Validators.required]],
        itemDescription : ['', [Validators.required]],
        make : ['', [Validators.required]],
        status : ['', [Validators.required]],
        remark : ['', [Validators.required]],
        file : ['', [Validators.required]],
      });
    }

    get f() { return this.enquiryFormGroup.controls; }

    onSubmit() {
      console.log('in Submit');
      this.submitted = true;
      // stop here if form is invalid
      if (this.enquiryFormGroup.invalid) {
        const d = this.enquiryFormGroup.value.date;
        console.log(this.fileId);
        this.fileCheck = this.fileId === undefined ? true : false;
        this.dateCheck = (d === undefined || d === '' || d === null) ? true : false;
          return;
      }
  
      console.log('success');
      console.log(this.enquiryFormGroup.value);
      console.log(this.enquiryFormGroup.value.item);
  
      this.enquiryDetail = new EnquiryDetail();
      this.enquiryDetail.companyName = this.enquiryFormGroup.value.companyName;
      this.enquiryDetail.personName = this.enquiryFormGroup.value.personName;
      this.enquiryDetail.mobile = this.enquiryFormGroup.value.mobile;
      this.enquiryDetail.place = this.enquiryFormGroup.value.place;
      this.enquiryDetail.enquiryNumber = this.enquiryFormGroup.value.enquiryNumber;
      this.enquiryDetail.date = this.enquiryFormGroup.value.date;
      this.enquiryDetail.itemDescription = this.enquiryFormGroup.value.itemDescription;
      this.enquiryDetail.make = this.enquiryFormGroup.value.make;
      this.enquiryDetail.status = this.enquiryFormGroup.value.status;
      this.enquiryDetail.remark = this.enquiryFormGroup.value.remark;
      this.enquiryDetail.fileName = this.fileId;
  
      console.log(this.enquiryDetail);
      console.log(this.enquiryDetail.enquiryNumber + ' ' + this.enquiryDetail.date);
          this.circularService.checkDuplicateEnquiry(this.enquiryDetail.enquiryNumber).subscribe((result1) => {
            console.log(result1);
            if (this.enquiryDetail.fileName === undefined || this.enquiryDetail.fileName === '') {
              console.log('check file upload')
            }
            if (!result1) {
                this.duplicateCheck = false;
                this.circularService.saveEnquiryDetail(this.enquiryDetail).subscribe((result) => {
                  console.log(result);
                  this.submitted = false;
                this.reset();
              });
            } else {
              console.log('in duplicate true');
              this.duplicateCheck = true;
            }
        });
    }


    checkDate() {
      console.log('check date chnage ' + this.enquiryFormGroup.value.date);
      if (this.enquiryFormGroup.value.date === undefined || this.enquiryFormGroup.value.date === '' ) {
        this.dateCheck = true;
      } else {
         this.dateCheck = false;
      }
    }
  
    reset(){
      this.fileId = undefined;
      this.submitted = false;
      this.fileCheck = false;
      this.dateCheck = false;
      this.progress = false;
      this.duplicateCheck = false;
      this.enquiryFormGroup.reset();
    }
  
    fileUpload(event) {
      this.progress = false;
      this.fileCheck = false;
      console.log('In file upload');
      console.log(event);
      console.log(event.target.files);
      this.selectedFiles = event.target.files;
      this.currentFileUpload = this.selectedFiles.item(0);
      this.uploadFileObj = new FileUpload();
      this.uploadFileObj.clientName = this.circularService.clientName;
      this.uploadFileObj.file = this.currentFileUpload;
      console.log(this.uploadFileObj.clientName);
      console.log(this.uploadFileObj.file);
      this.circularService.fileUpload(this.uploadFileObj).subscribe((result) => {
        this.progress = true;
        console.log(result);
        this.fileId  = result;
       });
      }



}

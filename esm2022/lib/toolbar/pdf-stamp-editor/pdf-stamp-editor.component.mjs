import { Component, Input, effect } from '@angular/core';
import { getVersionSuffix, pdfDefaultOptions } from '../../options/pdf-default-options';
import * as i0 from "@angular/core";
import * as i1 from "../../pdf-notification-service";
import * as i2 from "../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../responsive-visibility";
export class PdfStampEditorComponent {
    notificationService;
    cdr;
    show = true;
    isSelected = false;
    PDFViewerApplication;
    get pdfJsVersion() {
        return getVersionSuffix(pdfDefaultOptions.assetsFolder);
    }
    constructor(notificationService, cdr) {
        this.notificationService = notificationService;
        this.cdr = cdr;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('annotationeditormodechanged', ({ mode }) => {
            setTimeout(() => {
                this.isSelected = mode === 13;
                this.cdr.detectChanges();
            });
        });
    }
    onClick(event) {
        let button = event.target;
        while (button && button instanceof Element && !(button instanceof HTMLButtonElement)) {
            button = button.parentElement;
        }
        if (button instanceof HTMLButtonElement) {
            if (button.id !== 'primaryEditorStamp') {
                document.getElementById('primaryEditorStamp')?.click();
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfStampEditorComponent, deps: [{ token: i1.PDFNotificationService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfStampEditorComponent, selector: "pdf-stamp-editor", inputs: { show: "show" }, ngImport: i0, template: "<pdf-shy-button title=\"Text\" primaryToolbarId=\"primaryEditorStamp\"\n  [cssClass]=\"show | responsiveCSSClass : 'hiddenTinyView'\" l10nId=\"pdfjs-editor-stamp-button\"\n  l10nLabel=\"pdfjs-editor-stamp-button-label\" [order]=\"4200\" [action]=\"onClick\" [toggled]=\"isSelected\"\n  [closeOnClick]=\"true\"\n  image=\"<svg width='20px' height='20px' viewBox='0 0 24 24'> <path fill='currentColor' d='M13 19C13 19.7 13.13 20.37 13.35 21H5C3.9 21 3 20.11 3 19V5C3 3.9 3.9 3 5 3H19C20.11 3 21 3.9 21 5V13.35C20.37 13.13 19.7 13 19 13V5H5V19H13M13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H13.35C13.75 15.88 14.47 14.91 15.4 14.21L13.96 12.29M20 18V15H18V18H15V20H18V23H20V20H23V18H20Z' /> </svg>\">\n</pdf-shy-button>", styles: ["button{padding:0;height:25px;background-color:transparent;width:100%}button:focus{outline:none;border:none}.align-image-to-text{top:3px;position:relative;padding-right:4px}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfStampEditorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-stamp-editor', template: "<pdf-shy-button title=\"Text\" primaryToolbarId=\"primaryEditorStamp\"\n  [cssClass]=\"show | responsiveCSSClass : 'hiddenTinyView'\" l10nId=\"pdfjs-editor-stamp-button\"\n  l10nLabel=\"pdfjs-editor-stamp-button-label\" [order]=\"4200\" [action]=\"onClick\" [toggled]=\"isSelected\"\n  [closeOnClick]=\"true\"\n  image=\"<svg width='20px' height='20px' viewBox='0 0 24 24'> <path fill='currentColor' d='M13 19C13 19.7 13.13 20.37 13.35 21H5C3.9 21 3 20.11 3 19V5C3 3.9 3.9 3 5 3H19C20.11 3 21 3.9 21 5V13.35C20.37 13.13 19.7 13 19 13V5H5V19H13M13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H13.35C13.75 15.88 14.47 14.91 15.4 14.21L13.96 12.29M20 18V15H18V18H15V20H18V23H20V20H23V18H20Z' /> </svg>\">\n</pdf-shy-button>", styles: ["button{padding:0;height:25px;background-color:transparent;width:100%}button:focus{outline:none;border:none}.align-image-to-text{top:3px;position:relative;padding-right:4px}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }, { type: i0.ChangeDetectorRef }], propDecorators: { show: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXN0YW1wLWVkaXRvci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci9zcmMvbGliL3Rvb2xiYXIvcGRmLXN0YW1wLWVkaXRvci9wZGYtc3RhbXAtZWRpdG9yLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtc3RhbXAtZWRpdG9yL3BkZi1zdGFtcC1lZGl0b3IuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFxQixTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQzs7Ozs7QUFVeEYsTUFBTSxPQUFPLHVCQUF1QjtJQVlkO0lBQXFEO0lBVmxFLElBQUksR0FBeUIsSUFBSSxDQUFDO0lBRWxDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFFbEIsb0JBQW9CLENBQW9DO0lBRWhFLElBQVcsWUFBWTtRQUNyQixPQUFPLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxZQUFvQixtQkFBMkMsRUFBVSxHQUFzQjtRQUEzRSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXdCO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFDN0YsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BFLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM3QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxXQUFXO1FBQ2pCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLDZCQUE2QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQTBDLEVBQUUsRUFBRTtZQUN6SCxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNkLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLE9BQU8sQ0FBQyxLQUFtQjtRQUNoQyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzFCLE9BQU8sTUFBTSxJQUFJLE1BQU0sWUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxpQkFBaUIsQ0FBQyxFQUFFO1lBQ3BGLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxNQUFNLFlBQVksaUJBQWlCLEVBQUU7WUFDdkMsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLG9CQUFvQixFQUFFO2dCQUN0QyxRQUFRLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDeEQ7U0FDRjtJQUNILENBQUM7d0dBeENVLHVCQUF1Qjs0RkFBdkIsdUJBQXVCLGtGQ1pwQyw0c0JBS2lCOzs0RkRPSix1QkFBdUI7a0JBTG5DLFNBQVM7K0JBQ0Usa0JBQWtCOzJIQU1yQixJQUFJO3NCQURWLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBJbnB1dCwgZWZmZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uRWRpdG9yRWRpdG9yTW9kZUNoYW5nZWRFdmVudCB9IGZyb20gJy4uLy4uL2V2ZW50cy9hbm5vdGF0aW9uLWVkaXRvci1tb2RlLWNoYW5nZWQtZXZlbnQnO1xuaW1wb3J0IHsgZ2V0VmVyc2lvblN1ZmZpeCwgcGRmRGVmYXVsdE9wdGlvbnMgfSBmcm9tICcuLi8uLi9vcHRpb25zL3BkZi1kZWZhdWx0LW9wdGlvbnMnO1xuaW1wb3J0IHsgSVBERlZpZXdlckFwcGxpY2F0aW9uIH0gZnJvbSAnLi4vLi4vb3B0aW9ucy9wZGYtdmlld2VyLWFwcGxpY2F0aW9uJztcbmltcG9ydCB7IFBERk5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi9wZGYtbm90aWZpY2F0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2l2ZVZpc2liaWxpdHkgfSBmcm9tICcuLi8uLi9yZXNwb25zaXZlLXZpc2liaWxpdHknO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwZGYtc3RhbXAtZWRpdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BkZi1zdGFtcC1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wZGYtc3RhbXAtZWRpdG9yLmNvbXBvbmVudC5jc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgUGRmU3RhbXBFZGl0b3JDb21wb25lbnQge1xuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvdzogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIHB1YmxpYyBpc1NlbGVjdGVkID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIHB1YmxpYyBnZXQgcGRmSnNWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldFZlcnNpb25TdWZmaXgocGRmRGVmYXVsdE9wdGlvbnMuYXNzZXRzRm9sZGVyKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbm90aWZpY2F0aW9uU2VydmljZTogUERGTm90aWZpY2F0aW9uU2VydmljZSwgcHJpdmF0ZSBjZHI6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgICB0aGlzLm9uUGRmSnNJbml0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uUGRmSnNJbml0KCkge1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmV2ZW50QnVzLm9uKCdhbm5vdGF0aW9uZWRpdG9ybW9kZWNoYW5nZWQnLCAoeyBtb2RlIH06IEFubm90YXRpb25FZGl0b3JFZGl0b3JNb2RlQ2hhbmdlZEV2ZW50KSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gbW9kZSA9PT0gMTM7XG4gICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uQ2xpY2soZXZlbnQ6IFBvaW50ZXJFdmVudCk6IHZvaWQge1xuICAgIGxldCBidXR0b24gPSBldmVudC50YXJnZXQ7XG4gICAgd2hpbGUgKGJ1dHRvbiAmJiBidXR0b24gaW5zdGFuY2VvZiBFbGVtZW50ICYmICEoYnV0dG9uIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpKSB7XG4gICAgICBidXR0b24gPSBidXR0b24ucGFyZW50RWxlbWVudDtcbiAgICB9XG4gICAgaWYgKGJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICBpZiAoYnV0dG9uLmlkICE9PSAncHJpbWFyeUVkaXRvclN0YW1wJykge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJpbWFyeUVkaXRvclN0YW1wJyk/LmNsaWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCI8cGRmLXNoeS1idXR0b24gdGl0bGU9XCJUZXh0XCIgcHJpbWFyeVRvb2xiYXJJZD1cInByaW1hcnlFZGl0b3JTdGFtcFwiXG4gIFtjc3NDbGFzc109XCJzaG93IHwgcmVzcG9uc2l2ZUNTU0NsYXNzIDogJ2hpZGRlblRpbnlWaWV3J1wiIGwxMG5JZD1cInBkZmpzLWVkaXRvci1zdGFtcC1idXR0b25cIlxuICBsMTBuTGFiZWw9XCJwZGZqcy1lZGl0b3Itc3RhbXAtYnV0dG9uLWxhYmVsXCIgW29yZGVyXT1cIjQyMDBcIiBbYWN0aW9uXT1cIm9uQ2xpY2tcIiBbdG9nZ2xlZF09XCJpc1NlbGVjdGVkXCJcbiAgW2Nsb3NlT25DbGlja109XCJ0cnVlXCJcbiAgaW1hZ2U9XCI8c3ZnIHdpZHRoPScyMHB4JyBoZWlnaHQ9JzIwcHgnIHZpZXdCb3g9JzAgMCAyNCAyNCc+IDxwYXRoIGZpbGw9J2N1cnJlbnRDb2xvcicgZD0nTTEzIDE5QzEzIDE5LjcgMTMuMTMgMjAuMzcgMTMuMzUgMjFINUMzLjkgMjEgMyAyMC4xMSAzIDE5VjVDMyAzLjkgMy45IDMgNSAzSDE5QzIwLjExIDMgMjEgMy45IDIxIDVWMTMuMzVDMjAuMzcgMTMuMTMgMTkuNyAxMyAxOSAxM1Y1SDVWMTlIMTNNMTMuOTYgMTIuMjlMMTEuMjEgMTUuODNMOS4yNSAxMy40N0w2LjUgMTdIMTMuMzVDMTMuNzUgMTUuODggMTQuNDcgMTQuOTEgMTUuNCAxNC4yMUwxMy45NiAxMi4yOU0yMCAxOFYxNUgxOFYxOEgxNVYyMEgxOFYyM0gyMFYyMEgyM1YxOEgyMFonIC8+IDwvc3ZnPlwiPlxuPC9wZGYtc2h5LWJ1dHRvbj4iXX0=
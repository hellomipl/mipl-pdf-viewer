import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "./pdf-sidebar-content/pdf-sidebar-content.component";
import * as i3 from "./pdf-sidebar-toolbar/pdf-sidebar-toolbar.component";
export class PdfSidebarComponent {
    elementRef;
    ref;
    sidebarPositionTop;
    sidebarVisible = true;
    mobileFriendlyZoomScale = 1;
    showSidebarButton = true;
    customSidebar;
    customThumbnail;
    thumbnailDrawn = new EventEmitter();
    hideSidebarToolbar = true;
    constructor(elementRef, ref) {
        this.elementRef = elementRef;
        this.ref = ref;
    }
    showToolbarWhenNecessary() {
        const element = this.elementRef.nativeElement;
        const buttons = element.querySelectorAll('button');
        let visible = 0;
        for (let index = 0; index < buttons.length; index++) {
            const b = buttons.item(index);
            if (!b.hidden) {
                visible++;
            }
        }
        this.hideSidebarToolbar = visible <= 1;
        this.ref.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfSidebarComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfSidebarComponent, selector: "pdf-sidebar", inputs: { sidebarPositionTop: "sidebarPositionTop", sidebarVisible: "sidebarVisible", mobileFriendlyZoomScale: "mobileFriendlyZoomScale", showSidebarButton: "showSidebarButton", customSidebar: "customSidebar", customThumbnail: "customThumbnail" }, outputs: { thumbnailDrawn: "thumbnailDrawn" }, ngImport: i0, template: "<div>\n  <ng-content *ngTemplateOutlet=\"customSidebar ? customSidebar : defaultSidebar\"></ng-content>\n</div>\n\n<ng-template #defaultSidebar>\n  <div id=\"sidebarContainer\" [style.top]=\"sidebarPositionTop\">\n    <div id=\"additionalSidebarContainer\" class=\"hidden\" [class.hidden]=\"hideSidebarToolbar\">\n      <pdf-sidebar-toolbar [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"></pdf-sidebar-toolbar>\n    </div>\n    <pdf-sidebar-content\n      [customThumbnail]=\"customThumbnail\"\n      (thumbnailDrawn)=\"thumbnailDrawn.emit($event)\"\n      [hideSidebarToolbar]=\"hideSidebarToolbar\"\n      [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"\n    ></pdf-sidebar-content>\n    <div id=\"sidebarResizer\" class=\"hidden\"></div>\n  </div>\n</ng-template>\n", styles: [""], dependencies: [{ kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: i2.PdfSidebarContentComponent, selector: "pdf-sidebar-content", inputs: ["customThumbnail", "hideSidebarToolbar", "mobileFriendlyZoomScale"], outputs: ["thumbnailDrawn"] }, { kind: "component", type: i3.PdfSidebarToolbarComponent, selector: "pdf-sidebar-toolbar", inputs: ["mobileFriendlyZoomScale"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfSidebarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-sidebar', template: "<div>\n  <ng-content *ngTemplateOutlet=\"customSidebar ? customSidebar : defaultSidebar\"></ng-content>\n</div>\n\n<ng-template #defaultSidebar>\n  <div id=\"sidebarContainer\" [style.top]=\"sidebarPositionTop\">\n    <div id=\"additionalSidebarContainer\" class=\"hidden\" [class.hidden]=\"hideSidebarToolbar\">\n      <pdf-sidebar-toolbar [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"></pdf-sidebar-toolbar>\n    </div>\n    <pdf-sidebar-content\n      [customThumbnail]=\"customThumbnail\"\n      (thumbnailDrawn)=\"thumbnailDrawn.emit($event)\"\n      [hideSidebarToolbar]=\"hideSidebarToolbar\"\n      [mobileFriendlyZoomScale]=\"mobileFriendlyZoomScale\"\n    ></pdf-sidebar-content>\n    <div id=\"sidebarResizer\" class=\"hidden\"></div>\n  </div>\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }], propDecorators: { sidebarPositionTop: [{
                type: Input
            }], sidebarVisible: [{
                type: Input
            }], mobileFriendlyZoomScale: [{
                type: Input
            }], showSidebarButton: [{
                type: Input
            }], customSidebar: [{
                type: Input
            }], customThumbnail: [{
                type: Input
            }], thumbnailDrawn: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXNpZGViYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi9zaWRlYmFyL3BkZi1zaWRlYmFyL3BkZi1zaWRlYmFyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvc2lkZWJhci9wZGYtc2lkZWJhci9wZGYtc2lkZWJhci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLFNBQVMsRUFBYyxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBZSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFTbkgsTUFBTSxPQUFPLG1CQUFtQjtJQXdCVjtJQUFnQztJQXRCN0Msa0JBQWtCLENBQXFCO0lBR3ZDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFHdEIsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO0lBRzVCLGlCQUFpQixHQUF5QixJQUFJLENBQUM7SUFHL0MsYUFBYSxDQUErQjtJQUc1QyxlQUFlLENBQStCO0lBRzlDLGNBQWMsR0FBRyxJQUFJLFlBQVksRUFBMEIsQ0FBQztJQUU1RCxrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFFakMsWUFBb0IsVUFBc0IsRUFBVSxHQUFzQjtRQUF0RCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBbUI7SUFBRyxDQUFDO0lBRXZFLHdCQUF3QjtRQUM3QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQTRCLENBQUM7UUFDN0QsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNuRCxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFO2dCQUNiLE9BQU8sRUFBRSxDQUFDO2FBQ1g7U0FDRjtRQUNELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDMUIsQ0FBQzt3R0F0Q1UsbUJBQW1COzRGQUFuQixtQkFBbUIsMFZDVGhDLCt3QkFrQkE7OzRGRFRhLG1CQUFtQjtrQkFML0IsU0FBUzsrQkFDRSxhQUFhOytHQU1oQixrQkFBa0I7c0JBRHhCLEtBQUs7Z0JBSUMsY0FBYztzQkFEcEIsS0FBSztnQkFJQyx1QkFBdUI7c0JBRDdCLEtBQUs7Z0JBSUMsaUJBQWlCO3NCQUR2QixLQUFLO2dCQUlDLGFBQWE7c0JBRG5CLEtBQUs7Z0JBSUMsZUFBZTtzQkFEckIsS0FBSztnQkFJQyxjQUFjO3NCQURwQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT3V0cHV0LCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGRmVGh1bWJuYWlsRHJhd25FdmVudCB9IGZyb20gJy4uLy4uL2V2ZW50cy9wZGYtdGh1bWJuYWlsLWRyYXduLWV2ZW50JztcbmltcG9ydCB7IFJlc3BvbnNpdmVWaXNpYmlsaXR5IH0gZnJvbSAnLi4vLi4vcmVzcG9uc2l2ZS12aXNpYmlsaXR5JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGRmLXNpZGViYXInLFxuICB0ZW1wbGF0ZVVybDogJy4vcGRmLXNpZGViYXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wZGYtc2lkZWJhci5jb21wb25lbnQuY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBkZlNpZGViYXJDb21wb25lbnQge1xuICBASW5wdXQoKVxuICBwdWJsaWMgc2lkZWJhclBvc2l0aW9uVG9wOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNpZGViYXJWaXNpYmxlID0gdHJ1ZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgbW9iaWxlRnJpZW5kbHlab29tU2NhbGUgPSAxO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93U2lkZWJhckJ1dHRvbjogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21TaWRlYmFyOiBUZW1wbGF0ZVJlZjxhbnk+IHwgdW5kZWZpbmVkO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBjdXN0b21UaHVtYm5haWw6IFRlbXBsYXRlUmVmPGFueT4gfCB1bmRlZmluZWQ7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyB0aHVtYm5haWxEcmF3biA9IG5ldyBFdmVudEVtaXR0ZXI8UGRmVGh1bWJuYWlsRHJhd25FdmVudD4oKTtcblxuICBwdWJsaWMgaGlkZVNpZGViYXJUb29sYmFyID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICBwdWJsaWMgc2hvd1Rvb2xiYXJXaGVuTmVjZXNzYXJ5KCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCBidXR0b25zID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICBsZXQgdmlzaWJsZSA9IDA7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGJ1dHRvbnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBiID0gYnV0dG9ucy5pdGVtKGluZGV4KTtcbiAgICAgIGlmICghYi5oaWRkZW4pIHtcbiAgICAgICAgdmlzaWJsZSsrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmhpZGVTaWRlYmFyVG9vbGJhciA9IHZpc2libGUgPD0gMTtcbiAgICB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuIiwiPGRpdj5cbiAgPG5nLWNvbnRlbnQgKm5nVGVtcGxhdGVPdXRsZXQ9XCJjdXN0b21TaWRlYmFyID8gY3VzdG9tU2lkZWJhciA6IGRlZmF1bHRTaWRlYmFyXCI+PC9uZy1jb250ZW50PlxuPC9kaXY+XG5cbjxuZy10ZW1wbGF0ZSAjZGVmYXVsdFNpZGViYXI+XG4gIDxkaXYgaWQ9XCJzaWRlYmFyQ29udGFpbmVyXCIgW3N0eWxlLnRvcF09XCJzaWRlYmFyUG9zaXRpb25Ub3BcIj5cbiAgICA8ZGl2IGlkPVwiYWRkaXRpb25hbFNpZGViYXJDb250YWluZXJcIiBjbGFzcz1cImhpZGRlblwiIFtjbGFzcy5oaWRkZW5dPVwiaGlkZVNpZGViYXJUb29sYmFyXCI+XG4gICAgICA8cGRmLXNpZGViYXItdG9vbGJhciBbbW9iaWxlRnJpZW5kbHlab29tU2NhbGVdPVwibW9iaWxlRnJpZW5kbHlab29tU2NhbGVcIj48L3BkZi1zaWRlYmFyLXRvb2xiYXI+XG4gICAgPC9kaXY+XG4gICAgPHBkZi1zaWRlYmFyLWNvbnRlbnRcbiAgICAgIFtjdXN0b21UaHVtYm5haWxdPVwiY3VzdG9tVGh1bWJuYWlsXCJcbiAgICAgICh0aHVtYm5haWxEcmF3bik9XCJ0aHVtYm5haWxEcmF3bi5lbWl0KCRldmVudClcIlxuICAgICAgW2hpZGVTaWRlYmFyVG9vbGJhcl09XCJoaWRlU2lkZWJhclRvb2xiYXJcIlxuICAgICAgW21vYmlsZUZyaWVuZGx5Wm9vbVNjYWxlXT1cIm1vYmlsZUZyaWVuZGx5Wm9vbVNjYWxlXCJcbiAgICA+PC9wZGYtc2lkZWJhci1jb250ZW50PlxuICAgIDxkaXYgaWQ9XCJzaWRlYmFyUmVzaXplclwiIGNsYXNzPVwiaGlkZGVuXCI+PC9kaXY+XG4gIDwvZGl2PlxuPC9uZy10ZW1wbGF0ZT5cbiJdfQ==
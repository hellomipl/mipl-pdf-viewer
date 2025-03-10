import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { ScrollMode } from '../../options/pdf-scroll-mode';
import * as i0 from "@angular/core";
import * as i1 from "../../pdf-notification-service";
import * as i2 from "../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../responsive-visibility";
export class PdfWrappedScrollModeComponent {
    notificationService;
    show = true;
    scrollMode;
    pageViewMode;
    pageViewModeChange = new EventEmitter();
    onClick;
    PDFViewerApplication;
    constructor(notificationService) {
        this.notificationService = notificationService;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
        const emitter = this.pageViewModeChange;
        this.onClick = () => {
            queueMicrotask(() => {
                if (this.pageViewMode !== 'multiple' && this.pageViewMode !== 'infinite-scroll') {
                    emitter.emit('multiple');
                }
                this.PDFViewerApplication?.eventBus.dispatch('switchscrollmode', { mode: ScrollMode.WRAPPED });
            });
        };
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('switchscrollmode', (event) => {
            queueMicrotask(() => {
                this.scrollMode = event.mode;
            });
        });
    }
    ngOnDestroy() {
        this.onClick = undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfWrappedScrollModeComponent, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfWrappedScrollModeComponent, selector: "pdf-wrapped-scroll-mode", inputs: { show: "show", scrollMode: "scrollMode", pageViewMode: "pageViewMode" }, outputs: { pageViewModeChange: "pageViewModeChange" }, ngImport: i0, template: "<pdf-shy-button\n  [cssClass]=\"show | responsiveCSSClass : 'always-in-secondary-menu'\"\n  title=\"Wrapped Scrolling\"\n  primaryToolbarId=\"scrollWrapped\"\n  [toggled]=\"scrollMode == 2\"\n  l10nId=\"pdfjs-scroll-wrapped-button\"\n  [action]=\"onClick\"\n  l10nLabel=\"pdfjs-scroll-wrapped-button-label\"\n  [order]=\"3300\"\n  [closeOnClick]=\"false\"\n  image=\"<svg class='pdf-margin-top-3px' width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M5.5 4c1 0 1.5.5 1.5 1.5v5c0 1-.5 1.5-1.5 1.5h-3c-1 0-1.5-.5-1.5-1.5v-5C1 4.5 1.5 4 2.5 4zM7 0v.5C7 1.5 6.5 2 5.5 2h-3C1.5 2 1 1.5 1 .5V0h6zM7 16v-.5c0-1-.5-1.5-1.5-1.5h-3c-1 0-1.5.5-1.5 1.5v.5h6zM13.5 4c1 0 1.5.5 1.5 1.5v5c0 1-.5 1.5-1.5 1.5h-3c-1 0-1.5-.5-1.5-1.5v-5c0-1 .5-1.5 1.5-1.5zM15 0v.5c0 1-.5 1.5-1.5 1.5h-3C9.5 2 9 1.5 9 .5V0h6zM15 16v-.507c0-1-.5-1.5-1.5-1.5h-3C9.5 14 9 14.5 9 15.5v.5h6z' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0;margin-top:0;margin-bottom:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfWrappedScrollModeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-wrapped-scroll-mode', template: "<pdf-shy-button\n  [cssClass]=\"show | responsiveCSSClass : 'always-in-secondary-menu'\"\n  title=\"Wrapped Scrolling\"\n  primaryToolbarId=\"scrollWrapped\"\n  [toggled]=\"scrollMode == 2\"\n  l10nId=\"pdfjs-scroll-wrapped-button\"\n  [action]=\"onClick\"\n  l10nLabel=\"pdfjs-scroll-wrapped-button-label\"\n  [order]=\"3300\"\n  [closeOnClick]=\"false\"\n  image=\"<svg class='pdf-margin-top-3px' width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M5.5 4c1 0 1.5.5 1.5 1.5v5c0 1-.5 1.5-1.5 1.5h-3c-1 0-1.5-.5-1.5-1.5v-5C1 4.5 1.5 4 2.5 4zM7 0v.5C7 1.5 6.5 2 5.5 2h-3C1.5 2 1 1.5 1 .5V0h6zM7 16v-.5c0-1-.5-1.5-1.5-1.5h-3c-1 0-1.5.5-1.5 1.5v.5h6zM13.5 4c1 0 1.5.5 1.5 1.5v5c0 1-.5 1.5-1.5 1.5h-3c-1 0-1.5-.5-1.5-1.5v-5c0-1 .5-1.5 1.5-1.5zM15 0v.5c0 1-.5 1.5-1.5 1.5h-3C9.5 2 9 1.5 9 .5V0h6zM15 16v-.507c0-1-.5-1.5-1.5-1.5h-3C9.5 14 9 14.5 9 15.5v.5h6z' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0;margin-top:0;margin-bottom:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }], propDecorators: { show: [{
                type: Input
            }], scrollMode: [{
                type: Input
            }], pageViewMode: [{
                type: Input
            }], pageViewModeChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXdyYXBwZWQtc2Nyb2xsLW1vZGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi13cmFwcGVkLXNjcm9sbC1tb2RlL3BkZi13cmFwcGVkLXNjcm9sbC1tb2RlLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtd3JhcHBlZC1zY3JvbGwtbW9kZS9wZGYtd3JhcHBlZC1zY3JvbGwtbW9kZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQWEsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMxRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sK0JBQStCLENBQUM7Ozs7O0FBVzNELE1BQU0sT0FBTyw2QkFBNkI7SUFpQnBCO0lBZmIsSUFBSSxHQUF5QixJQUFJLENBQUM7SUFHbEMsVUFBVSxDQUFpQjtJQUczQixZQUFZLENBQW1CO0lBRy9CLGtCQUFrQixHQUFHLElBQUksWUFBWSxFQUFvQixDQUFDO0lBRTFELE9BQU8sQ0FBYztJQUVwQixvQkFBb0IsQ0FBb0M7SUFFaEUsWUFBb0IsbUJBQTJDO1FBQTNDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBd0I7UUFDN0QsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BFLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM3QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRTtZQUNsQixjQUFjLENBQUMsR0FBRyxFQUFFO2dCQUNsQixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssaUJBQWlCLEVBQUU7b0JBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzFCO2dCQUNELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuRSxjQUFjLENBQUMsR0FBRyxFQUFFO2dCQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQzNCLENBQUM7d0dBN0NVLDZCQUE2Qjs0RkFBN0IsNkJBQTZCLHdNQ1oxQyxrNUJBYUE7OzRGRERhLDZCQUE2QjtrQkFMekMsU0FBUzsrQkFDRSx5QkFBeUI7MkZBTTVCLElBQUk7c0JBRFYsS0FBSztnQkFJQyxVQUFVO3NCQURoQixLQUFLO2dCQUlDLFlBQVk7c0JBRGxCLEtBQUs7Z0JBSUMsa0JBQWtCO3NCQUR4QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkRlc3Ryb3ksIE91dHB1dCwgZWZmZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTY3JvbGxNb2RlIH0gZnJvbSAnLi4vLi4vb3B0aW9ucy9wZGYtc2Nyb2xsLW1vZGUnO1xuaW1wb3J0IHsgUGFnZVZpZXdNb2RlVHlwZSwgU2Nyb2xsTW9kZVR5cGUgfSBmcm9tICcuLi8uLi9vcHRpb25zL3BkZi12aWV3ZXInO1xuaW1wb3J0IHsgSVBERlZpZXdlckFwcGxpY2F0aW9uIH0gZnJvbSAnLi4vLi4vb3B0aW9ucy9wZGYtdmlld2VyLWFwcGxpY2F0aW9uJztcbmltcG9ydCB7IFBERk5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi9wZGYtbm90aWZpY2F0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2l2ZVZpc2liaWxpdHkgfSBmcm9tICcuLi8uLi9yZXNwb25zaXZlLXZpc2liaWxpdHknO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwZGYtd3JhcHBlZC1zY3JvbGwtbW9kZScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wZGYtd3JhcHBlZC1zY3JvbGwtbW9kZS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BkZi13cmFwcGVkLXNjcm9sbC1tb2RlLmNvbXBvbmVudC5jc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgUGRmV3JhcHBlZFNjcm9sbE1vZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBASW5wdXQoKVxuICBwdWJsaWMgc2hvdzogUmVzcG9uc2l2ZVZpc2liaWxpdHkgPSB0cnVlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzY3JvbGxNb2RlOiBTY3JvbGxNb2RlVHlwZTtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgcGFnZVZpZXdNb2RlOiBQYWdlVmlld01vZGVUeXBlO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgcGFnZVZpZXdNb2RlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxQYWdlVmlld01vZGVUeXBlPigpO1xuXG4gIHB1YmxpYyBvbkNsaWNrPzogKCkgPT4gdm9pZDtcblxuICBwcml2YXRlIFBERlZpZXdlckFwcGxpY2F0aW9uOiBJUERGVmlld2VyQXBwbGljYXRpb24gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBub3RpZmljYXRpb25TZXJ2aWNlOiBQREZOb3RpZmljYXRpb25TZXJ2aWNlKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgICB0aGlzLm9uUGRmSnNJbml0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMucGFnZVZpZXdNb2RlQ2hhbmdlO1xuICAgIHRoaXMub25DbGljayA9ICgpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucGFnZVZpZXdNb2RlICE9PSAnbXVsdGlwbGUnICYmIHRoaXMucGFnZVZpZXdNb2RlICE9PSAnaW5maW5pdGUtc2Nyb2xsJykge1xuICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnbXVsdGlwbGUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5ldmVudEJ1cy5kaXNwYXRjaCgnc3dpdGNoc2Nyb2xsbW9kZScsIHsgbW9kZTogU2Nyb2xsTW9kZS5XUkFQUEVEIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvblBkZkpzSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5ldmVudEJ1cy5vbignc3dpdGNoc2Nyb2xsbW9kZScsIChldmVudCkgPT4ge1xuICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICB0aGlzLnNjcm9sbE1vZGUgPSBldmVudC5tb2RlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5vbkNsaWNrID0gdW5kZWZpbmVkO1xuICB9XG59XG4iLCI8cGRmLXNoeS1idXR0b25cbiAgW2Nzc0NsYXNzXT1cInNob3cgfCByZXNwb25zaXZlQ1NTQ2xhc3MgOiAnYWx3YXlzLWluLXNlY29uZGFyeS1tZW51J1wiXG4gIHRpdGxlPVwiV3JhcHBlZCBTY3JvbGxpbmdcIlxuICBwcmltYXJ5VG9vbGJhcklkPVwic2Nyb2xsV3JhcHBlZFwiXG4gIFt0b2dnbGVkXT1cInNjcm9sbE1vZGUgPT0gMlwiXG4gIGwxMG5JZD1cInBkZmpzLXNjcm9sbC13cmFwcGVkLWJ1dHRvblwiXG4gIFthY3Rpb25dPVwib25DbGlja1wiXG4gIGwxMG5MYWJlbD1cInBkZmpzLXNjcm9sbC13cmFwcGVkLWJ1dHRvbi1sYWJlbFwiXG4gIFtvcmRlcl09XCIzMzAwXCJcbiAgW2Nsb3NlT25DbGlja109XCJmYWxzZVwiXG4gIGltYWdlPVwiPHN2ZyBjbGFzcz0ncGRmLW1hcmdpbi10b3AtM3B4JyB3aWR0aD0nMjRweCcgaGVpZ2h0PScyNHB4JyB2aWV3Qm94PScwIDAgMjQgMjQnPjxwYXRoIGZpbGw9J2N1cnJlbnRDb2xvcicgZD0nTTUuNSA0YzEgMCAxLjUuNSAxLjUgMS41djVjMCAxLS41IDEuNS0xLjUgMS41aC0zYy0xIDAtMS41LS41LTEuNS0xLjV2LTVDMSA0LjUgMS41IDQgMi41IDR6TTcgMHYuNUM3IDEuNSA2LjUgMiA1LjUgMmgtM0MxLjUgMiAxIDEuNSAxIC41VjBoNnpNNyAxNnYtLjVjMC0xLS41LTEuNS0xLjUtMS41aC0zYy0xIDAtMS41LjUtMS41IDEuNXYuNWg2ek0xMy41IDRjMSAwIDEuNS41IDEuNSAxLjV2NWMwIDEtLjUgMS41LTEuNSAxLjVoLTNjLTEgMC0xLjUtLjUtMS41LTEuNXYtNWMwLTEgLjUtMS41IDEuNS0xLjV6TTE1IDB2LjVjMCAxLS41IDEuNS0xLjUgMS41aC0zQzkuNSAyIDkgMS41IDkgLjVWMGg2ek0xNSAxNnYtLjUwN2MwLTEtLjUtMS41LTEuNS0xLjVoLTNDOS41IDE0IDkgMTQuNSA5IDE1LjV2LjVoNnonIC8+PC9zdmc+XCJcbj5cbjwvcGRmLXNoeS1idXR0b24+XG4iXX0=
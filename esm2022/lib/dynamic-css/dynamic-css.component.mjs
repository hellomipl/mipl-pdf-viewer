import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CSP_NONCE, Component, Inject, Input, Optional, PLATFORM_ID } from '@angular/core';
import { VerbosityLevel } from '../options/verbosity-level';
import { PdfBreakpoints } from '../responsive-visibility';
import { UnitToPx } from '../unit-to-px';
import * as i0 from "@angular/core";
import * as i1 from "../pdf-csp-policy.service";
export class DynamicCssComponent {
    renderer;
    document;
    platformId;
    pdfCspPolicyService;
    nonce;
    zoom = 1.0;
    width = 3.14159265359;
    xxs = 455;
    xs = 490;
    sm = 560;
    md = 610;
    lg = 660;
    xl = 740;
    xxl = 830;
    get style() {
        return `
#toolbarContainer .always-in-secondary-menu {
  display: none;
}

#secondaryToolbar .always-in-secondary-menu {
  display: inline-flex;
}

#outerContainer #mainContainer .visibleXXSView,
#outerContainer #mainContainer .visibleTinyView,
#outerContainer #mainContainer .visibleSmallView,
#outerContainer #mainContainer .visibleMediumView,
#outerContainer #mainContainer .visibleLargeView,
#outerContainer #mainContainer .visibleXLView,
#outerContainer #mainContainer .visibleXXLView {
  display: none;
}

.pdf-margin-top-3px {
  margin-top: 3px;
}

.pdf-margin-top--2px {
  margin-top: -2px;
}

@media all and (max-width: ${this.xxl}) {
  #sidebarContent {
    background-color: rgba(0, 0, 0, 0.7);
  }

  html[dir='ltr'] #outerContainer.sidebarOpen #viewerContainer {
    left: 0px !important;
  }
  html[dir='rtl'] #outerContainer.sidebarOpen #viewerContainer {
    right: 0px !important;
  }

  #outerContainer .hiddenLargeView,
  #outerContainer .hiddenMediumView {
    display: inherit;
  }
}

@media all and (max-width: ${this.lg}px) {
  .toolbarButtonSpacer {
    width: 15px;
  }

  #outerContainer .hiddenLargeView {
    display: none;
  }
  #outerContainer  #mainContainer .visibleLargeView {
    display: inherit;
  }
}

@media all and (max-width: ${this.md}px) {
  .toolbarButtonSpacer {
    display: none;
  }
  #outerContainer .hiddenMediumView {
    display: none;
  }
  #outerContainer  #mainContainer .visibleMediumView {
    display: inherit;
  }
}

@media all and (max-width: ${this.sm}px) {
  #outerContainer .hiddenSmallView,
  #outerContainer .hiddenSmallView * {
    display: none;
  }
  #outerContainer  #mainContainer .visibleSmallView {
    display: inherit;
  }
  .toolbarButtonSpacer {
    width: 0;
  }
  html[dir='ltr'] .findbar {
    left: 38px;
  }
  html[dir='rtl'] .findbar {
    right: 38px;
  }
}

#outerContainer .visibleXLView,
#outerContainer .visibleXXLView,
#outerContainer .visibleTinyView {
  display: none;
}

#outerContainer .hiddenXLView,
#outerContainer .hiddenXXLView {
  display: unset;
}

@media all and (max-width: ${this.xl}px) {
  #outerContainer .hiddenXLView {
    display: none;
  }
  #outerContainer .visibleXLView {
    display: inherit;
  }
}

@media all and (max-width: ${this.xxl}px) {
  #outerContainer .hiddenXXLView {
    display: none;
  }
  #outerContainer  #mainContainer .visibleXXLView {
    display: inherit;
  }
}

@media all and (max-width: ${this.xs}px) {
  #outerContainer .hiddenTinyView,
  #outerContainer .hiddenTinyView * {
    display: none;
  }
  #outerContainer  #mainContainer .visibleTinyView {
    display: inherit;
  }
}

@media all and (max-width: ${this.xxs}px) {
  #outerContainer .hiddenXXSView,
  #outerContainer .hiddenXXSView * {
    display: none;
  }
  #outerContainer #mainContainer .visibleXXSView {
    display: inherit;
  }
}
  `;
    }
    constructor(renderer, document, platformId, pdfCspPolicyService, nonce) {
        this.renderer = renderer;
        this.document = document;
        this.platformId = platformId;
        this.pdfCspPolicyService = pdfCspPolicyService;
        this.nonce = nonce;
        if (isPlatformBrowser(this.platformId)) {
            this.width = document.body.clientWidth;
        }
    }
    updateToolbarWidth() {
        const container = document.getElementById('toolbarViewer') ?? document.getElementById('outerContainer');
        if (!container) {
            return;
        }
        const toolbarWidthInPixels = container.clientWidth;
        const fullWith = this.document.body.clientWidth;
        const partialViewScale = fullWith / toolbarWidthInPixels;
        const scaleFactor = partialViewScale * (this.zoom ? this.zoom : 1);
        this.xs = scaleFactor * PdfBreakpoints.xs;
        this.sm = scaleFactor * PdfBreakpoints.sm;
        this.md = scaleFactor * PdfBreakpoints.md;
        this.lg = scaleFactor * PdfBreakpoints.lg;
        this.xl = scaleFactor * PdfBreakpoints.xl;
        this.xxl = scaleFactor * PdfBreakpoints.xxl;
        let styles = this.document.getElementById('pdf-dynamic-css');
        if (!styles) {
            styles = this.document.createElement('STYLE');
            styles.id = 'pdf-dynamic-css';
            this.pdfCspPolicyService.addTrustedCSS(styles, this.style);
            if (this.nonce) {
                styles.nonce = this.nonce;
            }
            this.renderer.appendChild(this.document.head, styles);
        }
        else {
            this.pdfCspPolicyService.addTrustedCSS(styles, this.style);
        }
    }
    removeScrollbarInInfiniteScrollMode(restoreHeight, pageViewMode, primaryMenuVisible, ngxExtendedPdfViewer, logLevel) {
        if (pageViewMode === 'infinite-scroll' || restoreHeight) {
            const viewer = document.getElementById('viewer');
            const zoom = document.getElementsByClassName('zoom')[0];
            if (viewer) {
                setTimeout(() => {
                    if (pageViewMode === 'infinite-scroll') {
                        const height = viewer.clientHeight + 17;
                        if (primaryMenuVisible) {
                            ngxExtendedPdfViewer.height = height + 35 + 'px';
                        }
                        else if (height > 17) {
                            ngxExtendedPdfViewer.height = height + 'px';
                        }
                        else if (ngxExtendedPdfViewer.height === undefined) {
                            ngxExtendedPdfViewer.height = '100%';
                        }
                        if (zoom) {
                            zoom.style.height = ngxExtendedPdfViewer.height;
                        }
                    }
                    else if (restoreHeight) {
                        ngxExtendedPdfViewer.autoHeight = true;
                        ngxExtendedPdfViewer.height = undefined;
                        this.checkHeight(ngxExtendedPdfViewer, logLevel);
                    }
                });
            }
        }
    }
    checkHeight(ngxExtendedPdfViewer, logLevel) {
        if (this.isHeightDefinedWithUnits(ngxExtendedPdfViewer.height))
            return;
        if (this.isPrinting())
            return;
        const container = this.getContainer();
        if (!container)
            return;
        if (this.isContainerHeightZero(container, ngxExtendedPdfViewer, logLevel)) {
            ngxExtendedPdfViewer.autoHeight = true;
        }
        if (ngxExtendedPdfViewer.autoHeight) {
            this.adjustHeight(container, ngxExtendedPdfViewer);
        }
    }
    /**
     * The height is defined with one of the units vh, vw, em, rem, etc.
     * So the height check isn't necessary.
     * @param height the height of the container
     */
    isHeightDefinedWithUnits(height) {
        return height ? isNaN(Number(height.replace('%', ''))) : false;
    }
    /**
     * #1702 workaround to a Firefox bug: when printing, container.clientHeight is temporarily 0,
     * causing ngx-extended-pdf-viewer to default to 100 pixels height. So it's better to do nothing.
     * @returns true if data-pdfjsprinting is set
     */
    isPrinting() {
        if (!this.isBrowser()) {
            return false;
        }
        return !!document.querySelector('[data-pdfjsprinting]');
    }
    /**
     * Checks if the code is running in a browser environment.
     */
    isBrowser() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }
    getContainer() {
        return typeof document !== 'undefined' ? document.getElementsByClassName('zoom')[0] : null;
    }
    isContainerHeightZero(container, ngxExtendedPdfViewer, logLevel) {
        if (container.clientHeight === 0) {
            if (logLevel >= VerbosityLevel.WARNINGS && !ngxExtendedPdfViewer.autoHeight && ngxExtendedPdfViewer.height !== '100%') {
                console.warn("The height of the PDF viewer widget is zero pixels. Please check the height attribute. Is there a syntax error? Or are you using a percentage with a CSS framework that doesn't support this? The height is adjusted automatedly.");
            }
            return true;
        }
        return false;
    }
    adjustHeight(container, ngxExtendedPdfViewer) {
        const available = window.innerHeight;
        const rect = container.getBoundingClientRect();
        const top = rect.top;
        let maximumHeight = available - top;
        const padding = this.calculateBorderMargin(container);
        maximumHeight -= padding;
        ngxExtendedPdfViewer.minHeight = maximumHeight > 100 ? `${maximumHeight}px` : '100px';
        ngxExtendedPdfViewer.markForCheck();
    }
    calculateBorderMargin(container) {
        if (container) {
            const computedStyle = window.getComputedStyle(container);
            const padding = UnitToPx.toPx(computedStyle.paddingBottom);
            const margin = UnitToPx.toPx(computedStyle.marginBottom);
            if (container.style.zIndex) {
                return padding + margin;
            }
            return padding + margin + this.calculateBorderMargin(container.parentElement);
        }
        return 0;
    }
    ngOnDestroy() {
        const styles = this.document.getElementById('pdf-dynamic-css');
        if (styles?.parentElement) {
            styles.parentElement.removeChild(styles);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: DynamicCssComponent, deps: [{ token: i0.Renderer2 }, { token: DOCUMENT }, { token: PLATFORM_ID }, { token: i1.PdfCspPolicyService }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: DynamicCssComponent, selector: "pdf-dynamic-css", inputs: { zoom: "zoom", width: "width" }, ngImport: i0, template: "", styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: DynamicCssComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-dynamic-css', template: "" }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i1.PdfCspPolicyService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CSP_NONCE]
                }, {
                    type: Optional
                }] }], propDecorators: { zoom: [{
                type: Input
            }], width: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pYy1jc3MuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi9keW5hbWljLWNzcy9keW5hbWljLWNzcy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci9zcmMvbGliL2R5bmFtaWMtY3NzL2R5bmFtaWMtY3NzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFhLFFBQVEsRUFBRSxXQUFXLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFFakgsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFPekMsTUFBTSxPQUFPLG1CQUFtQjtJQW1LWDtJQUNrQjtJQUNHO0lBQ3JCO0lBQytCO0lBckszQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBR1gsS0FBSyxHQUFHLGFBQWEsQ0FBQztJQUV0QixHQUFHLEdBQUcsR0FBRyxDQUFDO0lBRVYsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUVULEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFVCxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBRVQsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUVULEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFVCxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBRWpCLElBQVcsS0FBSztRQUNkLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkEy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cG9ydCB7IERPQ1VNRU5ULCBpc1BsYXRmb3JtQnJvd3NlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBDU1BfTk9OQ0UsIENvbXBvbmVudCwgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPcHRpb25hbCwgUExBVEZPUk1fSUQsIFJlbmRlcmVyMiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmd4SGFzSGVpZ2h0IH0gZnJvbSAnLi4vbmd4LWhhcy1oZWlnaHQnO1xuaW1wb3J0IHsgVmVyYm9zaXR5TGV2ZWwgfSBmcm9tICcuLi9vcHRpb25zL3ZlcmJvc2l0eS1sZXZlbCc7XG5pbXBvcnQgeyBQZGZDc3BQb2xpY3lTZXJ2aWNlIH0gZnJvbSAnLi4vcGRmLWNzcC1wb2xpY3kuc2VydmljZSc7XG5pbXBvcnQgeyBQZGZCcmVha3BvaW50cyB9IGZyb20gJy4uL3Jlc3BvbnNpdmUtdmlzaWJpbGl0eSc7XG5pbXBvcnQgeyBVbml0VG9QeCB9IGZyb20gJy4uL3VuaXQtdG8tcHgnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwZGYtZHluYW1pYy1jc3MnLFxuICB0ZW1wbGF0ZVVybDogJy4vZHluYW1pYy1jc3MuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9keW5hbWljLWNzcy5jb21wb25lbnQuY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIER5bmFtaWNDc3NDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBASW5wdXQoKVxuICBwdWJsaWMgem9vbSA9IDEuMDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgd2lkdGggPSAzLjE0MTU5MjY1MzU5O1xuXG4gIHB1YmxpYyB4eHMgPSA0NTU7XG5cbiAgcHVibGljIHhzID0gNDkwO1xuXG4gIHB1YmxpYyBzbSA9IDU2MDtcblxuICBwdWJsaWMgbWQgPSA2MTA7XG5cbiAgcHVibGljIGxnID0gNjYwO1xuXG4gIHB1YmxpYyB4bCA9IDc0MDtcblxuICBwdWJsaWMgeHhsID0gODMwO1xuXG4gIHB1YmxpYyBnZXQgc3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuI3Rvb2xiYXJDb250YWluZXIgLmFsd2F5cy1pbi1zZWNvbmRhcnktbWVudSB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG5cbiNzZWNvbmRhcnlUb29sYmFyIC5hbHdheXMtaW4tc2Vjb25kYXJ5LW1lbnUge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbn1cblxuI291dGVyQ29udGFpbmVyICNtYWluQ29udGFpbmVyIC52aXNpYmxlWFhTVmlldyxcbiNvdXRlckNvbnRhaW5lciAjbWFpbkNvbnRhaW5lciAudmlzaWJsZVRpbnlWaWV3LFxuI291dGVyQ29udGFpbmVyICNtYWluQ29udGFpbmVyIC52aXNpYmxlU21hbGxWaWV3LFxuI291dGVyQ29udGFpbmVyICNtYWluQ29udGFpbmVyIC52aXNpYmxlTWVkaXVtVmlldyxcbiNvdXRlckNvbnRhaW5lciAjbWFpbkNvbnRhaW5lciAudmlzaWJsZUxhcmdlVmlldyxcbiNvdXRlckNvbnRhaW5lciAjbWFpbkNvbnRhaW5lciAudmlzaWJsZVhMVmlldyxcbiNvdXRlckNvbnRhaW5lciAjbWFpbkNvbnRhaW5lciAudmlzaWJsZVhYTFZpZXcge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4ucGRmLW1hcmdpbi10b3AtM3B4IHtcbiAgbWFyZ2luLXRvcDogM3B4O1xufVxuXG4ucGRmLW1hcmdpbi10b3AtLTJweCB7XG4gIG1hcmdpbi10b3A6IC0ycHg7XG59XG5cbkBtZWRpYSBhbGwgYW5kIChtYXgtd2lkdGg6ICR7dGhpcy54eGx9KSB7XG4gICNzaWRlYmFyQ29udGVudCB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpO1xuICB9XG5cbiAgaHRtbFtkaXI9J2x0ciddICNvdXRlckNvbnRhaW5lci5zaWRlYmFyT3BlbiAjdmlld2VyQ29udGFpbmVyIHtcbiAgICBsZWZ0OiAwcHggIWltcG9ydGFudDtcbiAgfVxuICBodG1sW2Rpcj0ncnRsJ10gI291dGVyQ29udGFpbmVyLnNpZGViYXJPcGVuICN2aWV3ZXJDb250YWluZXIge1xuICAgIHJpZ2h0OiAwcHggIWltcG9ydGFudDtcbiAgfVxuXG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuTGFyZ2VWaWV3LFxuICAjb3V0ZXJDb250YWluZXIgLmhpZGRlbk1lZGl1bVZpZXcge1xuICAgIGRpc3BsYXk6IGluaGVyaXQ7XG4gIH1cbn1cblxuQG1lZGlhIGFsbCBhbmQgKG1heC13aWR0aDogJHt0aGlzLmxnfXB4KSB7XG4gIC50b29sYmFyQnV0dG9uU3BhY2VyIHtcbiAgICB3aWR0aDogMTVweDtcbiAgfVxuXG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuTGFyZ2VWaWV3IHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG4gICNvdXRlckNvbnRhaW5lciAgI21haW5Db250YWluZXIgLnZpc2libGVMYXJnZVZpZXcge1xuICAgIGRpc3BsYXk6IGluaGVyaXQ7XG4gIH1cbn1cblxuQG1lZGlhIGFsbCBhbmQgKG1heC13aWR0aDogJHt0aGlzLm1kfXB4KSB7XG4gIC50b29sYmFyQnV0dG9uU3BhY2VyIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuTWVkaXVtVmlldyB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuICAjb3V0ZXJDb250YWluZXIgICNtYWluQ29udGFpbmVyIC52aXNpYmxlTWVkaXVtVmlldyB7XG4gICAgZGlzcGxheTogaW5oZXJpdDtcbiAgfVxufVxuXG5AbWVkaWEgYWxsIGFuZCAobWF4LXdpZHRoOiAke3RoaXMuc219cHgpIHtcbiAgI291dGVyQ29udGFpbmVyIC5oaWRkZW5TbWFsbFZpZXcsXG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuU21hbGxWaWV3ICoge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cbiAgI291dGVyQ29udGFpbmVyICAjbWFpbkNvbnRhaW5lciAudmlzaWJsZVNtYWxsVmlldyB7XG4gICAgZGlzcGxheTogaW5oZXJpdDtcbiAgfVxuICAudG9vbGJhckJ1dHRvblNwYWNlciB7XG4gICAgd2lkdGg6IDA7XG4gIH1cbiAgaHRtbFtkaXI9J2x0ciddIC5maW5kYmFyIHtcbiAgICBsZWZ0OiAzOHB4O1xuICB9XG4gIGh0bWxbZGlyPSdydGwnXSAuZmluZGJhciB7XG4gICAgcmlnaHQ6IDM4cHg7XG4gIH1cbn1cblxuI291dGVyQ29udGFpbmVyIC52aXNpYmxlWExWaWV3LFxuI291dGVyQ29udGFpbmVyIC52aXNpYmxlWFhMVmlldyxcbiNvdXRlckNvbnRhaW5lciAudmlzaWJsZVRpbnlWaWV3IHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuI291dGVyQ29udGFpbmVyIC5oaWRkZW5YTFZpZXcsXG4jb3V0ZXJDb250YWluZXIgLmhpZGRlblhYTFZpZXcge1xuICBkaXNwbGF5OiB1bnNldDtcbn1cblxuQG1lZGlhIGFsbCBhbmQgKG1heC13aWR0aDogJHt0aGlzLnhsfXB4KSB7XG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuWExWaWV3IHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG4gICNvdXRlckNvbnRhaW5lciAudmlzaWJsZVhMVmlldyB7XG4gICAgZGlzcGxheTogaW5oZXJpdDtcbiAgfVxufVxuXG5AbWVkaWEgYWxsIGFuZCAobWF4LXdpZHRoOiAke3RoaXMueHhsfXB4KSB7XG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuWFhMVmlldyB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuICAjb3V0ZXJDb250YWluZXIgICNtYWluQ29udGFpbmVyIC52aXNpYmxlWFhMVmlldyB7XG4gICAgZGlzcGxheTogaW5oZXJpdDtcbiAgfVxufVxuXG5AbWVkaWEgYWxsIGFuZCAobWF4LXdpZHRoOiAke3RoaXMueHN9cHgpIHtcbiAgI291dGVyQ29udGFpbmVyIC5oaWRkZW5UaW55VmlldyxcbiAgI291dGVyQ29udGFpbmVyIC5oaWRkZW5UaW55VmlldyAqIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG4gICNvdXRlckNvbnRhaW5lciAgI21haW5Db250YWluZXIgLnZpc2libGVUaW55VmlldyB7XG4gICAgZGlzcGxheTogaW5oZXJpdDtcbiAgfVxufVxuXG5AbWVkaWEgYWxsIGFuZCAobWF4LXdpZHRoOiAke3RoaXMueHhzfXB4KSB7XG4gICNvdXRlckNvbnRhaW5lciAuaGlkZGVuWFhTVmlldyxcbiAgI291dGVyQ29udGFpbmVyIC5oaWRkZW5YWFNWaWV3ICoge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cbiAgI291dGVyQ29udGFpbmVyICNtYWluQ29udGFpbmVyIC52aXNpYmxlWFhTVmlldyB7XG4gICAgZGlzcGxheTogaW5oZXJpdDtcbiAgfVxufVxuICBgO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50LFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1JZCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBkZkNzcFBvbGljeVNlcnZpY2U6IFBkZkNzcFBvbGljeVNlcnZpY2UsXG4gICAgQEluamVjdChDU1BfTk9OQ0UpIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgbm9uY2U/OiBzdHJpbmcgfCBudWxsXG4gICkge1xuICAgIGlmIChpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpKSB7XG4gICAgICB0aGlzLndpZHRoID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlVG9vbGJhcldpZHRoKCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sYmFyVmlld2VyJykgPz8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyQ29udGFpbmVyJyk7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdG9vbGJhcldpZHRoSW5QaXhlbHMgPSBjb250YWluZXIuY2xpZW50V2lkdGg7XG5cbiAgICBjb25zdCBmdWxsV2l0aCA9IHRoaXMuZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcbiAgICBjb25zdCBwYXJ0aWFsVmlld1NjYWxlID0gZnVsbFdpdGggLyB0b29sYmFyV2lkdGhJblBpeGVscztcbiAgICBjb25zdCBzY2FsZUZhY3RvciA9IHBhcnRpYWxWaWV3U2NhbGUgKiAodGhpcy56b29tID8gdGhpcy56b29tIDogMSk7XG5cbiAgICB0aGlzLnhzID0gc2NhbGVGYWN0b3IgKiBQZGZCcmVha3BvaW50cy54cztcbiAgICB0aGlzLnNtID0gc2NhbGVGYWN0b3IgKiBQZGZCcmVha3BvaW50cy5zbTtcbiAgICB0aGlzLm1kID0gc2NhbGVGYWN0b3IgKiBQZGZCcmVha3BvaW50cy5tZDtcbiAgICB0aGlzLmxnID0gc2NhbGVGYWN0b3IgKiBQZGZCcmVha3BvaW50cy5sZztcbiAgICB0aGlzLnhsID0gc2NhbGVGYWN0b3IgKiBQZGZCcmVha3BvaW50cy54bDtcbiAgICB0aGlzLnh4bCA9IHNjYWxlRmFjdG9yICogUGRmQnJlYWtwb2ludHMueHhsO1xuXG4gICAgbGV0IHN0eWxlcyA9IHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BkZi1keW5hbWljLWNzcycpIGFzIEhUTUxTdHlsZUVsZW1lbnQ7XG4gICAgaWYgKCFzdHlsZXMpIHtcbiAgICAgIHN0eWxlcyA9IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnU1RZTEUnKSBhcyBIVE1MU3R5bGVFbGVtZW50O1xuICAgICAgc3R5bGVzLmlkID0gJ3BkZi1keW5hbWljLWNzcyc7XG4gICAgICB0aGlzLnBkZkNzcFBvbGljeVNlcnZpY2UuYWRkVHJ1c3RlZENTUyhzdHlsZXMsIHRoaXMuc3R5bGUpO1xuXG4gICAgICBpZiAodGhpcy5ub25jZSkge1xuICAgICAgICBzdHlsZXMubm9uY2UgPSB0aGlzLm5vbmNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbmRlcmVyLmFwcGVuZENoaWxkKHRoaXMuZG9jdW1lbnQuaGVhZCwgc3R5bGVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZGZDc3BQb2xpY3lTZXJ2aWNlLmFkZFRydXN0ZWRDU1Moc3R5bGVzLCB0aGlzLnN0eWxlKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlU2Nyb2xsYmFySW5JbmZpbml0ZVNjcm9sbE1vZGUoXG4gICAgcmVzdG9yZUhlaWdodDogYm9vbGVhbixcbiAgICBwYWdlVmlld01vZGU6IHN0cmluZyxcbiAgICBwcmltYXJ5TWVudVZpc2libGU6IGJvb2xlYW4sXG4gICAgbmd4RXh0ZW5kZWRQZGZWaWV3ZXI6IE5neEhhc0hlaWdodCxcbiAgICBsb2dMZXZlbDogVmVyYm9zaXR5TGV2ZWxcbiAgKTogdm9pZCB7XG4gICAgaWYgKHBhZ2VWaWV3TW9kZSA9PT0gJ2luZmluaXRlLXNjcm9sbCcgfHwgcmVzdG9yZUhlaWdodCkge1xuICAgICAgY29uc3Qgdmlld2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXdlcicpO1xuICAgICAgY29uc3Qgem9vbSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3pvb20nKVswXTtcbiAgICAgIGlmICh2aWV3ZXIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKHBhZ2VWaWV3TW9kZSA9PT0gJ2luZmluaXRlLXNjcm9sbCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHZpZXdlci5jbGllbnRIZWlnaHQgKyAxNztcbiAgICAgICAgICAgIGlmIChwcmltYXJ5TWVudVZpc2libGUpIHtcbiAgICAgICAgICAgICAgbmd4RXh0ZW5kZWRQZGZWaWV3ZXIuaGVpZ2h0ID0gaGVpZ2h0ICsgMzUgKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoZWlnaHQgPiAxNykge1xuICAgICAgICAgICAgICBuZ3hFeHRlbmRlZFBkZlZpZXdlci5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZ3hFeHRlbmRlZFBkZlZpZXdlci5oZWlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBuZ3hFeHRlbmRlZFBkZlZpZXdlci5oZWlnaHQgPSAnMTAwJSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoem9vbSkge1xuICAgICAgICAgICAgICAoPEhUTUxFbGVtZW50Pnpvb20pLnN0eWxlLmhlaWdodCA9IG5neEV4dGVuZGVkUGRmVmlld2VyLmhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHJlc3RvcmVIZWlnaHQpIHtcbiAgICAgICAgICAgIG5neEV4dGVuZGVkUGRmVmlld2VyLmF1dG9IZWlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgbmd4RXh0ZW5kZWRQZGZWaWV3ZXIuaGVpZ2h0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5jaGVja0hlaWdodChuZ3hFeHRlbmRlZFBkZlZpZXdlciwgbG9nTGV2ZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNoZWNrSGVpZ2h0KG5neEV4dGVuZGVkUGRmVmlld2VyOiBOZ3hIYXNIZWlnaHQsIGxvZ0xldmVsOiBWZXJib3NpdHlMZXZlbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzSGVpZ2h0RGVmaW5lZFdpdGhVbml0cyhuZ3hFeHRlbmRlZFBkZlZpZXdlci5oZWlnaHQpKSByZXR1cm47XG4gICAgaWYgKHRoaXMuaXNQcmludGluZygpKSByZXR1cm47XG5cbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmdldENvbnRhaW5lcigpO1xuICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG5cbiAgICBpZiAodGhpcy5pc0NvbnRhaW5lckhlaWdodFplcm8oY29udGFpbmVyLCBuZ3hFeHRlbmRlZFBkZlZpZXdlciwgbG9nTGV2ZWwpKSB7XG4gICAgICBuZ3hFeHRlbmRlZFBkZlZpZXdlci5hdXRvSGVpZ2h0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAobmd4RXh0ZW5kZWRQZGZWaWV3ZXIuYXV0b0hlaWdodCkge1xuICAgICAgdGhpcy5hZGp1c3RIZWlnaHQoY29udGFpbmVyLCBuZ3hFeHRlbmRlZFBkZlZpZXdlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBoZWlnaHQgaXMgZGVmaW5lZCB3aXRoIG9uZSBvZiB0aGUgdW5pdHMgdmgsIHZ3LCBlbSwgcmVtLCBldGMuXG4gICAqIFNvIHRoZSBoZWlnaHQgY2hlY2sgaXNuJ3QgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0gaGVpZ2h0IHRoZSBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lclxuICAgKi9cbiAgcHJpdmF0ZSBpc0hlaWdodERlZmluZWRXaXRoVW5pdHMoaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID8gaXNOYU4oTnVtYmVyKGhlaWdodC5yZXBsYWNlKCclJywgJycpKSkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAjMTcwMiB3b3JrYXJvdW5kIHRvIGEgRmlyZWZveCBidWc6IHdoZW4gcHJpbnRpbmcsIGNvbnRhaW5lci5jbGllbnRIZWlnaHQgaXMgdGVtcG9yYXJpbHkgMCxcbiAgICogY2F1c2luZyBuZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlciB0byBkZWZhdWx0IHRvIDEwMCBwaXhlbHMgaGVpZ2h0LiBTbyBpdCdzIGJldHRlciB0byBkbyBub3RoaW5nLlxuICAgKiBAcmV0dXJucyB0cnVlIGlmIGRhdGEtcGRmanNwcmludGluZyBpcyBzZXRcbiAgICovXG4gIHByaXZhdGUgaXNQcmludGluZygpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaXNCcm93c2VyKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtcGRmanNwcmludGluZ10nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGNvZGUgaXMgcnVubmluZyBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAqL1xuICBwcml2YXRlIGlzQnJvd3NlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29udGFpbmVyKCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgcmV0dXJuIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyAoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnem9vbScpWzBdIGFzIEhUTUxFbGVtZW50KSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGlzQ29udGFpbmVySGVpZ2h0WmVybyhjb250YWluZXI6IEhUTUxFbGVtZW50LCBuZ3hFeHRlbmRlZFBkZlZpZXdlcjogTmd4SGFzSGVpZ2h0LCBsb2dMZXZlbDogVmVyYm9zaXR5TGV2ZWwpOiBib29sZWFuIHtcbiAgICBpZiAoY29udGFpbmVyLmNsaWVudEhlaWdodCA9PT0gMCkge1xuICAgICAgaWYgKGxvZ0xldmVsID49IFZlcmJvc2l0eUxldmVsLldBUk5JTkdTICYmICFuZ3hFeHRlbmRlZFBkZlZpZXdlci5hdXRvSGVpZ2h0ICYmIG5neEV4dGVuZGVkUGRmVmlld2VyLmhlaWdodCAhPT0gJzEwMCUnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcIlRoZSBoZWlnaHQgb2YgdGhlIFBERiB2aWV3ZXIgd2lkZ2V0IGlzIHplcm8gcGl4ZWxzLiBQbGVhc2UgY2hlY2sgdGhlIGhlaWdodCBhdHRyaWJ1dGUuIElzIHRoZXJlIGEgc3ludGF4IGVycm9yPyBPciBhcmUgeW91IHVzaW5nIGEgcGVyY2VudGFnZSB3aXRoIGEgQ1NTIGZyYW1ld29yayB0aGF0IGRvZXNuJ3Qgc3VwcG9ydCB0aGlzPyBUaGUgaGVpZ2h0IGlzIGFkanVzdGVkIGF1dG9tYXRlZGx5LlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGp1c3RIZWlnaHQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgbmd4RXh0ZW5kZWRQZGZWaWV3ZXI6IE5neEhhc0hlaWdodCk6IHZvaWQge1xuICAgIGNvbnN0IGF2YWlsYWJsZSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCByZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHRvcCA9IHJlY3QudG9wO1xuICAgIGxldCBtYXhpbXVtSGVpZ2h0ID0gYXZhaWxhYmxlIC0gdG9wO1xuICAgIGNvbnN0IHBhZGRpbmcgPSB0aGlzLmNhbGN1bGF0ZUJvcmRlck1hcmdpbihjb250YWluZXIpO1xuICAgIG1heGltdW1IZWlnaHQgLT0gcGFkZGluZztcbiAgICBuZ3hFeHRlbmRlZFBkZlZpZXdlci5taW5IZWlnaHQgPSBtYXhpbXVtSGVpZ2h0ID4gMTAwID8gYCR7bWF4aW11bUhlaWdodH1weGAgOiAnMTAwcHgnO1xuICAgIG5neEV4dGVuZGVkUGRmVmlld2VyLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVCb3JkZXJNYXJnaW4oY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IG51bGwpOiBudW1iZXIge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShjb250YWluZXIpO1xuXG4gICAgICBjb25zdCBwYWRkaW5nID0gVW5pdFRvUHgudG9QeChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuICAgICAgY29uc3QgbWFyZ2luID0gVW5pdFRvUHgudG9QeChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgICBpZiAoY29udGFpbmVyLnN0eWxlLnpJbmRleCkge1xuICAgICAgICByZXR1cm4gcGFkZGluZyArIG1hcmdpbjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5nICsgbWFyZ2luICsgdGhpcy5jYWxjdWxhdGVCb3JkZXJNYXJnaW4oY29udGFpbmVyLnBhcmVudEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZGYtZHluYW1pYy1jc3MnKSBhcyBIVE1MRWxlbWVudDtcbiAgICBpZiAoc3R5bGVzPy5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAoc3R5bGVzLnBhcmVudEVsZW1lbnQgYXMgYW55KS5yZW1vdmVDaGlsZChzdHlsZXMpO1xuICAgIH1cbiAgfVxufVxuIiwiIl19
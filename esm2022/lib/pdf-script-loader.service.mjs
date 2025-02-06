import { CSP_NONCE, Inject, Injectable, effect, signal } from '@angular/core';
import { getVersionSuffix, pdfDefaultOptions } from './options/pdf-default-options';
import * as i0 from "@angular/core";
import * as i1 from "./pdf-csp-policy.service";
export class PDFScriptLoaderService {
    pdfCspPolicyService;
    csp_nonce;
    _forceUsingLegacyES5 = false;
    get forceUsingLegacyES5() {
        return this._forceUsingLegacyES5;
    }
    set forceUsingLegacyES5(value) {
        console.log('Please use the attribute `[forceUsingLegacyES5]` instead of setting the property in the service.');
        this._forceUsingLegacyES5 = value;
    }
    // this event is fired when the pdf.js library has been loaded and objects like PDFApplication are available
    onPDFJSInitSignal = signal(undefined);
    pdfjsVersion = getVersionSuffix(pdfDefaultOptions.assetsFolder);
    shuttingDown = false;
    _needsES5 = undefined;
    PDFViewerApplication;
    PDFViewerApplicationOptions;
    // private PDFViewerApplicationConstants: any;
    webViewerLoad;
    ngxExtendedPdfViewerIncompletelyInitialized = true;
    constructor(pdfCspPolicyService, csp_nonce) {
        this.pdfCspPolicyService = pdfCspPolicyService;
        this.csp_nonce = csp_nonce;
        effect(() => {
            if (this.onPDFJSInitSignal()) {
                this.pdfjsVersion = getVersionSuffix(pdfDefaultOptions.assetsFolder);
            }
        });
    }
    addScriptOpChainingSupport(useInlineScripts) {
        if (!useInlineScripts || this.isCSPApplied()) {
            return new Promise((resolve) => {
                const script = this.createScriptElement(pdfDefaultOptions.assetsFolder + '/op-chaining-support.js');
                script.onload = () => {
                    script.remove();
                    script.onload = null;
                    resolve(globalThis.ngxExtendedPdfViewerCanRunModernJSCode);
                };
                script.onerror = () => {
                    script.remove();
                    globalThis.ngxExtendedPdfViewerCanRunModernJSCode = false;
                    resolve(false);
                    script.onerror = null;
                };
                document.body.appendChild(script);
            });
        }
        else {
            const code = `
new (function () {
  class BrowserCompatibilityTester {
    // Does your browser doesn't support private fields?
    #privateField;

    constructor() {
      // Does your browser support the logical assignment operators?
      let x = false;
      x ||= true;

      this.#privateMethod();
    }

    // Does your browser doesn't support private methods?
    #privateMethod() {
      // check the the browser supports string.at()
      return 'hello'.at(4);
    }

    supportsOptionalChaining() {
      const optionalChaining = {
        support: true,
      };
      return optionalChaining?.support;
    }
  }

  function supportsPromiseWithResolvers() {
    const iframe = document.createElement('iframe');
    document.firstElementChild.append(iframe);
    const useLegacyPdfViewer = 'withResolvers' in iframe.contentWindow['Promise'];
    iframe.parentElement.removeChild(iframe);

    return useLegacyPdfViewer;
  }

  const supportsOptionalChaining = new BrowserCompatibilityTester().supportsOptionalChaining();
  const supportModernPromises = supportsPromiseWithResolvers();
  window.ngxExtendedPdfViewerCanRunModernJSCode = supportsOptionalChaining && supportModernPromises;
})();
`;
            const script = this.createInlineScript(code);
            document.getElementsByTagName('head')[0].appendChild(script);
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (globalThis.ngxExtendedPdfViewerCanRunModernJSCode !== undefined) {
                        clearInterval(interval);
                        resolve(globalThis.ngxExtendedPdfViewerCanRunModernJSCode);
                    }
                }, 1);
            });
        }
    }
    createInlineScript(code) {
        const script = document.createElement('script');
        script.async = true;
        script.type = 'module';
        script.className = `ngx-extended-pdf-viewer-script`;
        script.text = code;
        if (this.csp_nonce) {
            // assigning null to script.nonce results in a string "null", so let's add a null check
            script.nonce = this.csp_nonce;
        }
        return script;
    }
    isCSPAppliedViaMetaTag() {
        const metaTags = document.getElementsByTagName('meta');
        for (let i = 0; i < metaTags.length; i++) {
            if (metaTags[i].getAttribute('http-equiv') === 'Content-Security-Policy') {
                return true;
            }
        }
        return false;
    }
    isCSPApplied() {
        if (this.isCSPAppliedViaMetaTag()) {
            return true;
        }
        return false;
    }
    createScriptElement(sourcePath) {
        const script = document.createElement('script');
        script.async = true;
        script.type = sourcePath.endsWith('.mjs') ? 'module' : 'text/javascript';
        script.className = `ngx-extended-pdf-viewer-script`;
        this.pdfCspPolicyService.addTrustedJavaScript(script, sourcePath);
        return script;
    }
    getPdfJsPath(artifact) {
        let suffix = pdfDefaultOptions._internalFilenameSuffix;
        if (this._needsES5) {
            suffix = ''; // we don't publish minified ES5 files
        }
        suffix += '.mjs';
        const assets = pdfDefaultOptions.assetsFolder;
        const versionSuffix = getVersionSuffix(assets);
        const artifactPath = `/${artifact}-`;
        const es5 = this._needsES5 ? '-es5' : '';
        return assets + artifactPath + versionSuffix + es5 + suffix;
    }
    async loadViewer(useInlineScripts) {
        return new Promise((resolve) => {
            const viewerPath = this.getPdfJsPath('viewer');
            const listener = (event) => {
                const { PDFViewerApplication, PDFViewerApplicationOptions, webViewerLoad } = event.detail;
                this.PDFViewerApplication = PDFViewerApplication;
                this.PDFViewerApplicationOptions = PDFViewerApplicationOptions;
                this.webViewerLoad = webViewerLoad;
                resolve();
                document.removeEventListener('ngxViewerFileHasBeenLoaded', listener);
            };
            document.addEventListener('ngxViewerFileHasBeenLoaded', listener, { once: true });
            const script = this.createScriptElement(viewerPath);
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    }
    addFeatures() {
        return new Promise((resolve) => {
            const script = this.createScriptElement(pdfDefaultOptions.assetsFolder + '/additional-features.js');
            script.onload = () => {
                script.remove();
            };
            script.onerror = () => {
                script.remove();
                resolve();
            };
            document.body.appendChild(script);
        });
    }
    async ensurePdfJsHasBeenLoaded(useInlineScripts, forceUsingLegacyES5) {
        if (this.PDFViewerApplication) {
            return true;
        }
        this._needsES5 = forceUsingLegacyES5 || (await this.needsES5(useInlineScripts));
        if (forceUsingLegacyES5) {
            pdfDefaultOptions.needsES5 = true;
        }
        await this.loadViewer(useInlineScripts);
        return this.PDFViewerApplication !== undefined;
    }
    ngOnDestroy() {
        this.shuttingDown = true;
        if (typeof window === 'undefined') {
            return; // fast escape for server side rendering
        }
        delete globalThis['setNgxExtendedPdfViewerSource'];
        const w = window;
        delete w.pdfjsLib;
        document.querySelectorAll('.ngx-extended-pdf-viewer-script').forEach((e) => {
            e.onload = null;
            e.remove();
        });
    }
    iOSVersionRequiresES5() {
        if (typeof window === 'undefined') {
            // server-side rendering
            return false;
        }
        const match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (match !== undefined && match !== null) {
            return parseInt(match[1], 10) < 14;
        }
        return false;
    }
    async needsES5(useInlineScripts) {
        if (typeof window === 'undefined') {
            // server-side rendering
            return false;
        }
        if (this._needsES5 === undefined) {
            const isIE = !!globalThis.MSInputMethodContext && !!document.documentMode;
            const isEdge = /Edge\/\d./i.test(navigator.userAgent);
            const isIOs13OrBelow = this.iOSVersionRequiresES5();
            let needsES5 = typeof ReadableStream === 'undefined' || typeof Promise['allSettled'] === 'undefined';
            if (needsES5 || isIE || isEdge || isIOs13OrBelow || this.forceUsingLegacyES5) {
                this._needsES5 = true;
                return true;
            }
            this._needsES5 = !(await this.ngxExtendedPdfViewerCanRunModernJSCode(useInlineScripts));
            this.polyfillPromiseWithResolversIfZoneJSOverwritesIt();
        }
        return this._needsES5;
    }
    /**
     * Angular 16 uses zone.js 0.13.3, and this version has a problem with Promise.withResolvers.
     * If your browser supports Promise.withResolvers, zone.js accidentally overwrites it with "undefined".
     * This method adds a polyfill for Promise.withResolvers if it is not available.
     */
    polyfillPromiseWithResolversIfZoneJSOverwritesIt() {
        const TypelessPromise = Promise;
        if (!TypelessPromise.withResolvers) {
            TypelessPromise.withResolvers = function withResolvers() {
                let a;
                let b;
                const c = new this(function (resolve, reject) {
                    a = resolve;
                    b = reject;
                });
                return { resolve: a, reject: b, promise: c };
            };
        }
    }
    ngxExtendedPdfViewerCanRunModernJSCode(useInlineScripts) {
        return new Promise((resolve) => {
            const support = globalThis.ngxExtendedPdfViewerCanRunModernJSCode;
            support !== undefined ? resolve(support) : resolve(this.addScriptOpChainingSupport(useInlineScripts));
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PDFScriptLoaderService, deps: [{ token: i1.PdfCspPolicyService }, { token: CSP_NONCE }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PDFScriptLoaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PDFScriptLoaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i1.PdfCspPolicyService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [CSP_NONCE]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXNjcmlwdC1sb2FkZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvcGRmLXNjcmlwdC1sb2FkZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQWEsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQzs7O0FBUXBGLE1BQU0sT0FBTyxzQkFBc0I7SUEwQk47SUFBcUU7SUF6QnhGLG9CQUFvQixHQUFHLEtBQUssQ0FBQztJQUNyQyxJQUFXLG1CQUFtQjtRQUM1QixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztJQUNuQyxDQUFDO0lBQ0QsSUFBVyxtQkFBbUIsQ0FBQyxLQUFLO1FBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0dBQWtHLENBQUMsQ0FBQztRQUNoSCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLENBQUM7SUFFRCw0R0FBNEc7SUFDckcsaUJBQWlCLEdBQUcsTUFBTSxDQUFvQyxTQUFTLENBQUMsQ0FBQztJQUV6RSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFaEUsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUVwQixTQUFTLEdBQXdCLFNBQVMsQ0FBQztJQUU1QyxvQkFBb0IsQ0FBeUI7SUFDN0MsMkJBQTJCLENBQWdDO0lBQ2xFLDhDQUE4QztJQUN2QyxhQUFhLENBQWtEO0lBRS9ELDJDQUEyQyxHQUFHLElBQUksQ0FBQztJQUUxRCxZQUEyQixtQkFBd0MsRUFBNkIsU0FBaUI7UUFBdEYsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUE2Qixj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c0NBQXNDLENBQUM7WUFDekUsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUN4RyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7d0dBdFJVLHNCQUFzQixxREEwQjRDLFNBQVM7NEdBMUIzRSxzQkFBc0IsY0FGckIsTUFBTTs7NEZBRVAsc0JBQXNCO2tCQUhsQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQjs7MEJBMkJ1RSxNQUFNOzJCQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDU1BfTk9OQ0UsIEluamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95LCBlZmZlY3QsIHNpZ25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgZ2V0VmVyc2lvblN1ZmZpeCwgcGRmRGVmYXVsdE9wdGlvbnMgfSBmcm9tICcuL29wdGlvbnMvcGRmLWRlZmF1bHQtb3B0aW9ucyc7XG5pbXBvcnQgeyBJUERGVmlld2VyQXBwbGljYXRpb24gfSBmcm9tICcuL29wdGlvbnMvcGRmLXZpZXdlci1hcHBsaWNhdGlvbic7XG5pbXBvcnQgeyBJUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zIH0gZnJvbSAnLi9vcHRpb25zL3BkZi12aWV3ZXItYXBwbGljYXRpb24tb3B0aW9ucyc7XG5pbXBvcnQgeyBQZGZDc3BQb2xpY3lTZXJ2aWNlIH0gZnJvbSAnLi9wZGYtY3NwLXBvbGljeS5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIFBERlNjcmlwdExvYWRlclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9mb3JjZVVzaW5nTGVnYWN5RVM1ID0gZmFsc2U7XG4gIHB1YmxpYyBnZXQgZm9yY2VVc2luZ0xlZ2FjeUVTNSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yY2VVc2luZ0xlZ2FjeUVTNTtcbiAgfVxuICBwdWJsaWMgc2V0IGZvcmNlVXNpbmdMZWdhY3lFUzUodmFsdWUpIHtcbiAgICBjb25zb2xlLmxvZygnUGxlYXNlIHVzZSB0aGUgYXR0cmlidXRlIGBbZm9yY2VVc2luZ0xlZ2FjeUVTNV1gIGluc3RlYWQgb2Ygc2V0dGluZyB0aGUgcHJvcGVydHkgaW4gdGhlIHNlcnZpY2UuJyk7XG4gICAgdGhpcy5fZm9yY2VVc2luZ0xlZ2FjeUVTNSA9IHZhbHVlO1xuICB9XG5cbiAgLy8gdGhpcyBldmVudCBpcyBmaXJlZCB3aGVuIHRoZSBwZGYuanMgbGlicmFyeSBoYXMgYmVlbiBsb2FkZWQgYW5kIG9iamVjdHMgbGlrZSBQREZBcHBsaWNhdGlvbiBhcmUgYXZhaWxhYmxlXG4gIHB1YmxpYyBvblBERkpTSW5pdFNpZ25hbCA9IHNpZ25hbDxJUERGVmlld2VyQXBwbGljYXRpb24gfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XG5cbiAgcHVibGljIHBkZmpzVmVyc2lvbiA9IGdldFZlcnNpb25TdWZmaXgocGRmRGVmYXVsdE9wdGlvbnMuYXNzZXRzRm9sZGVyKTtcblxuICBwdWJsaWMgc2h1dHRpbmdEb3duID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfbmVlZHNFUzU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgcHVibGljIFBERlZpZXdlckFwcGxpY2F0aW9uITogSVBERlZpZXdlckFwcGxpY2F0aW9uO1xuICBwdWJsaWMgUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zITogSVBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucztcbiAgLy8gcHJpdmF0ZSBQREZWaWV3ZXJBcHBsaWNhdGlvbkNvbnN0YW50czogYW55O1xuICBwdWJsaWMgd2ViVmlld2VyTG9hZDogKGNzcFBvbGljeVNlcnZpY2U6IFBkZkNzcFBvbGljeVNlcnZpY2UpID0+IHZvaWQ7XG5cbiAgcHVibGljIG5neEV4dGVuZGVkUGRmVmlld2VySW5jb21wbGV0ZWx5SW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIHBkZkNzcFBvbGljeVNlcnZpY2U6IFBkZkNzcFBvbGljeVNlcnZpY2UsIEBJbmplY3QoQ1NQX05PTkNFKSBwcml2YXRlIGNzcF9ub25jZTogc3RyaW5nKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLm9uUERGSlNJbml0U2lnbmFsKCkpIHtcbiAgICAgICAgdGhpcy5wZGZqc1ZlcnNpb24gPSBnZXRWZXJzaW9uU3VmZml4KHBkZkRlZmF1bHRPcHRpb25zLmFzc2V0c0ZvbGRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFkZFNjcmlwdE9wQ2hhaW5pbmdTdXBwb3J0KHVzZUlubGluZVNjcmlwdHM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoIXVzZUlubGluZVNjcmlwdHMgfHwgdGhpcy5pc0NTUEFwcGxpZWQoKSkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcmlwdCA9IHRoaXMuY3JlYXRlU2NyaXB0RWxlbWVudChwZGZEZWZhdWx0T3B0aW9ucy5hc3NldHNGb2xkZXIgKyAnL29wLWNoYWluaW5nLXN1cHBvcnQuanMnKTtcbiAgICAgICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBzY3JpcHQucmVtb3ZlKCk7XG4gICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgcmVzb2x2ZSgoPGFueT5nbG9iYWxUaGlzKS5uZ3hFeHRlbmRlZFBkZlZpZXdlckNhblJ1bk1vZGVybkpTQ29kZSBhcyBib29sZWFuKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgc2NyaXB0LnJlbW92ZSgpO1xuICAgICAgICAgICg8YW55Pmdsb2JhbFRoaXMpLm5neEV4dGVuZGVkUGRmVmlld2VyQ2FuUnVuTW9kZXJuSlNDb2RlID0gZmFsc2U7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb2RlID0gYFxubmV3IChmdW5jdGlvbiAoKSB7XG4gIGNsYXNzIEJyb3dzZXJDb21wYXRpYmlsaXR5VGVzdGVyIHtcbiAgICAvLyBEb2VzIHlvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgcHJpdmF0ZSBmaWVsZHM/XG4gICAgI3ByaXZhdGVGaWVsZDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgLy8gRG9lcyB5b3VyIGJyb3dzZXIgc3VwcG9ydCB0aGUgbG9naWNhbCBhc3NpZ25tZW50IG9wZXJhdG9ycz9cbiAgICAgIGxldCB4ID0gZmFsc2U7XG4gICAgICB4IHx8PSB0cnVlO1xuXG4gICAgICB0aGlzLiNwcml2YXRlTWV0aG9kKCk7XG4gICAgfVxuXG4gICAgLy8gRG9lcyB5b3VyIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHByaXZhdGUgbWV0aG9kcz9cbiAgICAjcHJpdmF0ZU1ldGhvZCgpIHtcbiAgICAgIC8vIGNoZWNrIHRoZSB0aGUgYnJvd3NlciBzdXBwb3J0cyBzdHJpbmcuYXQoKVxuICAgICAgcmV0dXJuICdoZWxsbycuYXQoNCk7XG4gICAgfVxuXG4gICAgc3VwcG9ydHNPcHRpb25hbENoYWluaW5nKCkge1xuICAgICAgY29uc3Qgb3B0aW9uYWxDaGFpbmluZyA9IHtcbiAgICAgICAgc3VwcG9ydDogdHJ1ZSxcbiAgICAgIH07XG4gICAgICByZXR1cm4gb3B0aW9uYWxDaGFpbmluZz8uc3VwcG9ydDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdXBwb3J0c1Byb21pc2VXaXRoUmVzb2x2ZXJzKCkge1xuICAgIGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGRvY3VtZW50LmZpcnN0RWxlbWVudENoaWxkLmFwcGVuZChpZnJhbWUpO1xuICAgIGNvbnN0IHVzZUxlZ2FjeVBkZlZpZXdlciA9ICd3aXRoUmVzb2x2ZXJzJyBpbiBpZnJhbWUuY29udGVudFdpbmRvd1snUHJvbWlzZSddO1xuICAgIGlmcmFtZS5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGlmcmFtZSk7XG5cbiAgICByZXR1cm4gdXNlTGVnYWN5UGRmVmlld2VyO1xuICB9XG5cbiAgY29uc3Qgc3VwcG9ydHNPcHRpb25hbENoYWluaW5nID0gbmV3IEJyb3dzZXJDb21wYXRpYmlsaXR5VGVzdGVyKCkuc3VwcG9ydHNPcHRpb25hbENoYWluaW5nKCk7XG4gIGNvbnN0IHN1cHBvcnRNb2Rlcm5Qcm9taXNlcyA9IHN1cHBvcnRzUHJvbWlzZVdpdGhSZXNvbHZlcnMoKTtcbiAgd2luZG93Lm5neEV4dGVuZGVkUGRmVmlld2VyQ2FuUnVuTW9kZXJuSlNDb2RlID0gc3VwcG9ydHNPcHRpb25hbENoYWluaW5nICYmIHN1cHBvcnRNb2Rlcm5Qcm9taXNlcztcbn0pKCk7XG5gO1xuICAgICAgY29uc3Qgc2NyaXB0ID0gdGhpcy5jcmVhdGVJbmxpbmVTY3JpcHQoY29kZSk7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKChnbG9iYWxUaGlzIGFzIGFueSkubmd4RXh0ZW5kZWRQZGZWaWV3ZXJDYW5SdW5Nb2Rlcm5KU0NvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICByZXNvbHZlKChnbG9iYWxUaGlzIGFzIGFueSkubmd4RXh0ZW5kZWRQZGZWaWV3ZXJDYW5SdW5Nb2Rlcm5KU0NvZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUlubGluZVNjcmlwdChjb2RlOiBzdHJpbmcpOiBIVE1MU2NyaXB0RWxlbWVudCB7XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICBzY3JpcHQudHlwZSA9ICdtb2R1bGUnO1xuICAgIHNjcmlwdC5jbGFzc05hbWUgPSBgbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXItc2NyaXB0YDtcbiAgICBzY3JpcHQudGV4dCA9IGNvZGU7XG4gICAgaWYgKHRoaXMuY3NwX25vbmNlKSB7XG4gICAgICAvLyBhc3NpZ25pbmcgbnVsbCB0byBzY3JpcHQubm9uY2UgcmVzdWx0cyBpbiBhIHN0cmluZyBcIm51bGxcIiwgc28gbGV0J3MgYWRkIGEgbnVsbCBjaGVja1xuICAgICAgc2NyaXB0Lm5vbmNlID0gdGhpcy5jc3Bfbm9uY2U7XG4gICAgfVxuICAgIHJldHVybiBzY3JpcHQ7XG4gIH1cblxuICBwcml2YXRlIGlzQ1NQQXBwbGllZFZpYU1ldGFUYWcoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWV0YVRhZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWV0YScpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YVRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChtZXRhVGFnc1tpXS5nZXRBdHRyaWJ1dGUoJ2h0dHAtZXF1aXYnKSA9PT0gJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5Jykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0NTUEFwcGxpZWQoKSB7XG4gICAgaWYgKHRoaXMuaXNDU1BBcHBsaWVkVmlhTWV0YVRhZygpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVTY3JpcHRFbGVtZW50KHNvdXJjZVBhdGg6IHN0cmluZyk6IEhUTUxTY3JpcHRFbGVtZW50IHtcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgIHNjcmlwdC50eXBlID0gc291cmNlUGF0aC5lbmRzV2l0aCgnLm1qcycpID8gJ21vZHVsZScgOiAndGV4dC9qYXZhc2NyaXB0JztcbiAgICBzY3JpcHQuY2xhc3NOYW1lID0gYG5neC1leHRlbmRlZC1wZGYtdmlld2VyLXNjcmlwdGA7XG4gICAgdGhpcy5wZGZDc3BQb2xpY3lTZXJ2aWNlLmFkZFRydXN0ZWRKYXZhU2NyaXB0KHNjcmlwdCwgc291cmNlUGF0aCk7XG4gICAgcmV0dXJuIHNjcmlwdDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UGRmSnNQYXRoKGFydGlmYWN0OiAncGRmJyB8ICd2aWV3ZXInKSB7XG4gICAgbGV0IHN1ZmZpeCA9IHBkZkRlZmF1bHRPcHRpb25zLl9pbnRlcm5hbEZpbGVuYW1lU3VmZml4O1xuICAgIGlmICh0aGlzLl9uZWVkc0VTNSkge1xuICAgICAgc3VmZml4ID0gJyc7IC8vIHdlIGRvbid0IHB1Ymxpc2ggbWluaWZpZWQgRVM1IGZpbGVzXG4gICAgfVxuICAgIHN1ZmZpeCArPSAnLm1qcyc7XG4gICAgY29uc3QgYXNzZXRzID0gcGRmRGVmYXVsdE9wdGlvbnMuYXNzZXRzRm9sZGVyO1xuICAgIGNvbnN0IHZlcnNpb25TdWZmaXggPSBnZXRWZXJzaW9uU3VmZml4KGFzc2V0cyk7XG4gICAgY29uc3QgYXJ0aWZhY3RQYXRoID0gYC8ke2FydGlmYWN0fS1gO1xuICAgIGNvbnN0IGVzNSA9IHRoaXMuX25lZWRzRVM1ID8gJy1lczUnIDogJyc7XG5cbiAgICByZXR1cm4gYXNzZXRzICsgYXJ0aWZhY3RQYXRoICsgdmVyc2lvblN1ZmZpeCArIGVzNSArIHN1ZmZpeDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbG9hZFZpZXdlcih1c2VJbmxpbmVTY3JpcHRzOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCB2aWV3ZXJQYXRoID0gdGhpcy5nZXRQZGZKc1BhdGgoJ3ZpZXdlcicpO1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSAoZXZlbnQ6IEN1c3RvbUV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgUERGVmlld2VyQXBwbGljYXRpb24sIFBERlZpZXdlckFwcGxpY2F0aW9uT3B0aW9ucywgd2ViVmlld2VyTG9hZCB9ID0gZXZlbnQuZGV0YWlsO1xuICAgICAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uID0gUERGVmlld2VyQXBwbGljYXRpb247XG4gICAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zID0gUERGVmlld2VyQXBwbGljYXRpb25PcHRpb25zO1xuICAgICAgICB0aGlzLndlYlZpZXdlckxvYWQgPSB3ZWJWaWV3ZXJMb2FkO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25neFZpZXdlckZpbGVIYXNCZWVuTG9hZGVkJywgbGlzdGVuZXIpO1xuICAgICAgfTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ25neFZpZXdlckZpbGVIYXNCZWVuTG9hZGVkJywgbGlzdGVuZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IHRoaXMuY3JlYXRlU2NyaXB0RWxlbWVudCh2aWV3ZXJQYXRoKTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkRmVhdHVyZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBzY3JpcHQgPSB0aGlzLmNyZWF0ZVNjcmlwdEVsZW1lbnQocGRmRGVmYXVsdE9wdGlvbnMuYXNzZXRzRm9sZGVyICsgJy9hZGRpdGlvbmFsLWZlYXR1cmVzLmpzJyk7XG4gICAgICBzY3JpcHQub25sb2FkID0gKCkgPT4ge1xuICAgICAgICBzY3JpcHQucmVtb3ZlKCk7XG4gICAgICB9O1xuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIHNjcmlwdC5yZW1vdmUoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcblxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGVuc3VyZVBkZkpzSGFzQmVlbkxvYWRlZCh1c2VJbmxpbmVTY3JpcHRzOiBib29sZWFuLCBmb3JjZVVzaW5nTGVnYWN5RVM1OiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB0aGlzLl9uZWVkc0VTNSA9IGZvcmNlVXNpbmdMZWdhY3lFUzUgfHwgKGF3YWl0IHRoaXMubmVlZHNFUzUodXNlSW5saW5lU2NyaXB0cykpO1xuICAgIGlmIChmb3JjZVVzaW5nTGVnYWN5RVM1KSB7XG4gICAgICBwZGZEZWZhdWx0T3B0aW9ucy5uZWVkc0VTNSA9IHRydWU7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMubG9hZFZpZXdlcih1c2VJbmxpbmVTY3JpcHRzKTtcbiAgICByZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbiAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuc2h1dHRpbmdEb3duID0gdHJ1ZTtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjsgLy8gZmFzdCBlc2NhcGUgZm9yIHNlcnZlciBzaWRlIHJlbmRlcmluZ1xuICAgIH1cbiAgICBkZWxldGUgZ2xvYmFsVGhpc1snc2V0Tmd4RXh0ZW5kZWRQZGZWaWV3ZXJTb3VyY2UnXTtcblxuICAgIGNvbnN0IHcgPSB3aW5kb3cgYXMgYW55O1xuICAgIGRlbGV0ZSB3LnBkZmpzTGliO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci1zY3JpcHQnKS5mb3JFYWNoKChlOiBIVE1MU2NyaXB0RWxlbWVudCkgPT4ge1xuICAgICAgZS5vbmxvYWQgPSBudWxsO1xuICAgICAgZS5yZW1vdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaU9TVmVyc2lvblJlcXVpcmVzRVM1KCk6IGJvb2xlYW4ge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gc2VydmVyLXNpZGUgcmVuZGVyaW5nXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IG1hdGNoID0gbmF2aWdhdG9yLmFwcFZlcnNpb24ubWF0Y2goL09TIChcXGQrKV8oXFxkKylfPyhcXGQrKT8vKTtcbiAgICBpZiAobWF0Y2ggIT09IHVuZGVmaW5lZCAmJiBtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoWzFdLCAxMCkgPCAxNDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG5lZWRzRVM1KHVzZUlubGluZVNjcmlwdHM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIHNlcnZlci1zaWRlIHJlbmRlcmluZ1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbmVlZHNFUzUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaXNJRSA9ICEhKDxhbnk+Z2xvYmFsVGhpcykuTVNJbnB1dE1ldGhvZENvbnRleHQgJiYgISEoPGFueT5kb2N1bWVudCkuZG9jdW1lbnRNb2RlO1xuICAgICAgY29uc3QgaXNFZGdlID0gL0VkZ2VcXC9cXGQuL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIGNvbnN0IGlzSU9zMTNPckJlbG93ID0gdGhpcy5pT1NWZXJzaW9uUmVxdWlyZXNFUzUoKTtcbiAgICAgIGxldCBuZWVkc0VTNSA9IHR5cGVvZiBSZWFkYWJsZVN0cmVhbSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIFByb21pc2VbJ2FsbFNldHRsZWQnXSA9PT0gJ3VuZGVmaW5lZCc7XG4gICAgICBpZiAobmVlZHNFUzUgfHwgaXNJRSB8fCBpc0VkZ2UgfHwgaXNJT3MxM09yQmVsb3cgfHwgdGhpcy5mb3JjZVVzaW5nTGVnYWN5RVM1KSB7XG4gICAgICAgIHRoaXMuX25lZWRzRVM1ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc0VTNSA9ICEoYXdhaXQgdGhpcy5uZ3hFeHRlbmRlZFBkZlZpZXdlckNhblJ1bk1vZGVybkpTQ29kZSh1c2VJbmxpbmVTY3JpcHRzKSk7XG4gICAgICB0aGlzLnBvbHlmaWxsUHJvbWlzZVdpdGhSZXNvbHZlcnNJZlpvbmVKU092ZXJ3cml0ZXNJdCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbmVlZHNFUzU7XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciAxNiB1c2VzIHpvbmUuanMgMC4xMy4zLCBhbmQgdGhpcyB2ZXJzaW9uIGhhcyBhIHByb2JsZW0gd2l0aCBQcm9taXNlLndpdGhSZXNvbHZlcnMuXG4gICAqIElmIHlvdXIgYnJvd3NlciBzdXBwb3J0cyBQcm9taXNlLndpdGhSZXNvbHZlcnMsIHpvbmUuanMgYWNjaWRlbnRhbGx5IG92ZXJ3cml0ZXMgaXQgd2l0aCBcInVuZGVmaW5lZFwiLlxuICAgKiBUaGlzIG1ldGhvZCBhZGRzIGEgcG9seWZpbGwgZm9yIFByb21pc2Uud2l0aFJlc29sdmVycyBpZiBpdCBpcyBub3QgYXZhaWxhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBwb2x5ZmlsbFByb21pc2VXaXRoUmVzb2x2ZXJzSWZab25lSlNPdmVyd3JpdGVzSXQoKSB7XG4gICAgY29uc3QgVHlwZWxlc3NQcm9taXNlID0gUHJvbWlzZSBhcyBhbnk7XG4gICAgaWYgKCFUeXBlbGVzc1Byb21pc2Uud2l0aFJlc29sdmVycykge1xuICAgICAgVHlwZWxlc3NQcm9taXNlLndpdGhSZXNvbHZlcnMgPSBmdW5jdGlvbiB3aXRoUmVzb2x2ZXJzKCkge1xuICAgICAgICBsZXQgYTogdW5rbm93bjtcbiAgICAgICAgbGV0IGI6IHVua25vd247XG4gICAgICAgIGNvbnN0IGMgPSBuZXcgdGhpcyhmdW5jdGlvbiAocmVzb2x2ZTogdW5rbm93biwgcmVqZWN0OiB1bmtub3duKSB7XG4gICAgICAgICAgYSA9IHJlc29sdmU7XG4gICAgICAgICAgYiA9IHJlamVjdDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7IHJlc29sdmU6IGEsIHJlamVjdDogYiwgcHJvbWlzZTogYyB9O1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG5neEV4dGVuZGVkUGRmVmlld2VyQ2FuUnVuTW9kZXJuSlNDb2RlKHVzZUlubGluZVNjcmlwdHM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHN1cHBvcnQgPSAoPGFueT5nbG9iYWxUaGlzKS5uZ3hFeHRlbmRlZFBkZlZpZXdlckNhblJ1bk1vZGVybkpTQ29kZTtcbiAgICAgIHN1cHBvcnQgIT09IHVuZGVmaW5lZCA/IHJlc29sdmUoc3VwcG9ydCkgOiByZXNvbHZlKHRoaXMuYWRkU2NyaXB0T3BDaGFpbmluZ1N1cHBvcnQodXNlSW5saW5lU2NyaXB0cykpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
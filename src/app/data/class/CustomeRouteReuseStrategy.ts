import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router";

export class CustomeRouteReuseStrategy implements RouteReuseStrategy{
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path || 'root';
    return path === 'root';
  }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const path = route.routeConfig?.path || 'root';
    if (handle) {
      this.storedRoutes.set(path, handle);
    }
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path || 'root';
    return this.storedRoutes.has(path);
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path || 'root';
    return this.storedRoutes.get(path) || null;
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

}


/**
 *
 */
export default class Router {
	constructor(options) {
		this.options = Object.assign({
				context: window,
				startListening: true,
				updateIntervalRate: 50,
				mode: options && options.mode == 'history' && !!(history.pushState) ? 'history' : 'hash',
				root: options && options.root ? '/' + Router.clearSlashes(options.root) + '/' : '/',
			},
			options
		);
		
		this.routes = [];
		if (this.options.startListening) {
			this.listen();
		}
	}
	
	add(route, handler) {
		let newRoute = typeof route === 'string' ? Router.cleanPath(route) : route;
		
		if (typeof route === 'function') {
			handler = route;
			newRoute = '';
		}
		
		this.routes.push({
			route: new RegExp(newRoute),
			handler
		});
		
		return this;
	}
	
	remove(route, handler) {
		const routeName = String(new RegExp(route));
		
		this.routes = this.routes.filter(
			activeRoute =>
			String(new RegExp(activeRoute.route)) !== routeName ||
			(handler ? activeRoute.handler !== handler : false)
		);
		
		return this;
	}
	
	reload() {
		return this.check();
	}
	
	check() {
		const hash = this.currentRoute;
		let hasMatch = false;
		
		for (let route of this.routes) {
			const match = hash.match(route.route);
			
			if (match !== null) {
				match.shift();
				route.handler.apply({}, match);
				hasMatch = true;
				
				if (this.options.debug) {
					log(`Fetching: /${hash}`);
				}
			}
		}
		
		if (!hasMatch) {
			this.navigateError(hash);
		}
		
		return this;
	}
	
	
	listen() {
		let self = this;
		let current = this.check().currentRoute;
		let f = () => {
			if (current !== self.currentRoute) {
				current = self.currentRoute;
				self.check();
			}
		}
		
		clearInterval(this.interval);
		this.interval = setInterval(f, this.options.updateIntervalRate);
		return this;
	}
	
	navigate(path) {
		if (this.options.mode === 'history') {
			this.options.context.history.pushState(null, null, this.options.root + Router.clearSlashes(path));
		} else {
			window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + Router.cleanPath(path || '');
		}
		return this;
	}
	
	navigateError(hash) {
		if (this.options.debug) {
			log(`Fetching: /${hash}, not a valid route.`);
		}
		
		this.navigate('error');
		
		return this;
	}
	
	get currentRoute() {
		if (this.options.mode === 'history') {
			let fragment = Router.clearSlashes(decodeURI(location.pathname + location.search));
			fragment = fragment.replace(/\?(.*)$/, '');
			fragment = this.options.root != '/' ? fragment.replace(this.options.root, '') : fragment;
			return Router.clearSlashes(fragment);
		}
		return Router.cleanPath(this.options.context.location.hash);
	}
	
	static cleanPath(path) {
		return path ? String(path).replace(/^[#\/]+|\/+$|\?.*$/g, '') : ''
	}
	
	static clearSlashes(path) {
		return path ? String(path).replace(/\/$/, '').replace(/^\//, '') : '';
	}
}
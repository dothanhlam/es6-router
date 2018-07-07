import Router from './../router';

test('routing should work', () => {
	const router = new Router();
	router.add(() => {}).add('home', () => {});
	window.location.hash = 'home';
	expect(router.currentRoute).toEqual('home');
});
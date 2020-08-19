/**
 * Internal dependencies
 */
import { createMissingMenuItems } from '../actions';
import {
	resolveMenuItems,
	getMenuItemToClientIdMapping,
	dispatch,
	apiFetch,
} from '../controls';
import { menuItemsQuery } from '../utils';

jest.mock( '../utils', () => {
	const utils = require.requireActual( '../utils' );
	// Mock serializeProcessing to always return the callback for easier testing and less boilerplate.
	utils.serializeProcessing = ( callback ) => callback;
	return utils;
} );

describe( 'createMissingMenuItems', () => {
	it( 'create missing menu for navigation block', () => {
		const post = {
			id: 'navigation-post-1',
			slug: 'navigation-post-1',
			type: 'page',
			meta: {
				menuId: 1,
			},
			blocks: [
				{
					attributes: { showSubmenuIcon: true },
					clientId: 'navigation-block-client-id',
					innerBlocks: [],
					isValid: true,
					name: 'core/navigation',
				},
			],
		};

		const mapping = {};

		const menuItemPlaceholder = {
			id: 87,
			title: {
				raw: 'Placeholder',
				rendered: 'Placeholder',
			},
		};

		const menuItems = [];

		const action = createMissingMenuItems( post );

		expect( action.next( post ).value ).toEqual(
			getMenuItemToClientIdMapping( post.id )
		);

		expect( action.next( mapping ).value ).toEqual(
			apiFetch( {
				path: `/__experimental/menu-items`,
				method: 'POST',
				data: {
					title: 'Placeholder',
					url: 'Placeholder',
					menu_order: 0,
				},
			} )
		);

		expect( action.next( menuItemPlaceholder ).value ).toEqual(
			resolveMenuItems( post.meta.menuId )
		);

		expect( action.next( menuItems ).value ).toEqual(
			dispatch(
				'core',
				'receiveEntityRecords',
				'root',
				'menuItem',
				[ ...menuItems, menuItemPlaceholder ],
				menuItemsQuery( post.meta.menuId ),
				false
			)
		);

		expect( action.next().value ).toEqual( {
			type: 'SET_MENU_ITEM_TO_CLIENT_ID_MAPPING',
			postId: post.id,
			mapping: {
				87: 'navigation-block-client-id',
			},
		} );

		expect( action.next( [] ).done ).toBe( true );
	} );

	it( 'create missing menu for navigation link block', () => {
		const post = {
			id: 'navigation-post-1',
			slug: 'navigation-post-1',
			type: 'page',
			meta: {
				menuId: 1,
			},
			blocks: [
				{
					attributes: { showSubmenuIcon: true },
					clientId: 'navigation-block-client-id',
					innerBlocks: [
						{
							attributes: {
								label: 'wp.org',
								opensInNewTab: false,
								url: 'http://wp.org',
							},
							clientId: 'navigation-link-block-client-id-1',
							innerBlocks: [],
							isValid: true,
							name: 'core/navigation-link',
						},
						{
							attributes: {
								label: 'wp.com',
								opensInNewTab: false,
								url: 'http://wp.com',
							},
							clientId: 'navigation-link-block-client-id-2',
							innerBlocks: [],
							isValid: true,
							name: 'core/navigation-link',
						},
					],
					isValid: true,
					name: 'core/navigation',
				},
			],
		};

		const mapping = {
			87: 'navigation-block-client-id',
			100: 'navigation-link-block-client-id-1',
		};

		const menuItemPlaceholder = {
			id: 101,
			title: {
				raw: 'Placeholder',
				rendered: 'Placeholder',
			},
		};

		const menuItems = [
			{
				id: 100,
				title: {
					raw: 'wp.com',
					rendered: 'wp.com',
				},
				url: 'http://wp.com',
				menu_order: 1,
				menus: [ 1 ],
			},
			{
				id: 101,
				title: {
					raw: 'wp.org',
					rendered: 'wp.org',
				},
				url: 'http://wp.org',
				menu_order: 2,
				menus: [ 1 ],
			},
		];

		const action = createMissingMenuItems( post );

		expect( action.next( post ).value ).toEqual(
			getMenuItemToClientIdMapping( post.id )
		);

		expect( action.next( mapping ).value ).toEqual(
			apiFetch( {
				path: `/__experimental/menu-items`,
				method: 'POST',
				data: {
					title: 'Placeholder',
					url: 'Placeholder',
					menu_order: 0,
				},
			} )
		);

		expect( action.next( menuItemPlaceholder ).value ).toEqual(
			resolveMenuItems( post.meta.menuId )
		);

		expect( action.next( menuItems ).value ).toEqual(
			dispatch(
				'core',
				'receiveEntityRecords',
				'root',
				'menuItem',
				[ ...menuItems, menuItemPlaceholder ],
				menuItemsQuery( post.meta.menuId ),
				false
			)
		);

		expect( action.next().value ).toEqual( {
			type: 'SET_MENU_ITEM_TO_CLIENT_ID_MAPPING',
			postId: post.id,
			mapping: {
				87: 'navigation-block-client-id',
				100: 'navigation-link-block-client-id-1',
				101: 'navigation-link-block-client-id-2',
			},
		} );

		expect( action.next( [] ).done ).toBe( true );
	} );
} );

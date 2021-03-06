import SpellCheckerService from '@joplinapp/lib/services/spellChecker/SpellCheckerService';
import bridge from '../../../../../services/bridge';
import { menuItems, ContextMenuOptions, ContextMenuItemType } from '../../../utils/contextMenu';
const Resource = require('@joplinapp/lib/models/Resource');

// x and y are the absolute coordinates, as returned by the context-menu event
// handler on the webContent. This function will return null if the point is
// not within the TinyMCE editor.
function contextMenuElement(editor:any, x:number, y:number) {
	const iframes = document.getElementsByClassName('tox-edit-area__iframe');
	if (!iframes.length) return null;

	const iframeRect = iframes[0].getBoundingClientRect();

	if (iframeRect.x < x && iframeRect.y < y && iframeRect.right > x && iframeRect.bottom > y) {
		const relativeX = x - iframeRect.x;
		const relativeY = y - iframeRect.y;

		return editor.getDoc().elementFromPoint(relativeX, relativeY);
	}

	return null;
}

interface ContextMenuActionOptions {
	current: ContextMenuOptions,
}

const contextMenuActionOptions:ContextMenuActionOptions = { current: null };

export default function(editor:any) {
	const contextMenuItems = menuItems();

	bridge().window().webContents.on('context-menu', (_event:any, params:any) => {
		const element = contextMenuElement(editor, params.x, params.y);
		if (!element) return;

		const Menu = bridge().Menu;
		const MenuItem = bridge().MenuItem;

		let itemType:ContextMenuItemType = ContextMenuItemType.None;
		let resourceId = '';
		let linkToCopy = null;

		if (element.nodeName === 'IMG') {
			itemType = ContextMenuItemType.Image;
			resourceId = Resource.pathToId(element.src);
		} else if (element.nodeName === 'A') {
			resourceId = Resource.pathToId(element.href);
			itemType = resourceId ? ContextMenuItemType.Resource : ContextMenuItemType.Link;
			linkToCopy = element.getAttribute('href') || '';
		} else {
			itemType = ContextMenuItemType.Text;
		}

		contextMenuActionOptions.current = {
			itemType,
			resourceId,
			linkToCopy,
			textToCopy: null,
			htmlToCopy: editor.selection ? editor.selection.getContent() : '',
			insertContent: (content:string) => {
				editor.insertContent(content);
			},
			isReadOnly: false,
		};

		const menu = new Menu();

		for (const itemName in contextMenuItems) {
			const item = contextMenuItems[itemName];

			if (!item.isActive(itemType, contextMenuActionOptions.current)) continue;

			menu.append(new MenuItem({
				label: item.label,
				click: () => {
					item.onAction(contextMenuActionOptions.current);
				},
			}));
		}

		const spellCheckerMenuItems = SpellCheckerService.instance().contextMenuItems(params.misspelledWord, params.dictionarySuggestions);

		for (const item of spellCheckerMenuItems) {
			menu.append(item);
		}

		menu.popup();
	});
}

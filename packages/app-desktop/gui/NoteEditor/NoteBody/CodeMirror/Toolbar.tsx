import * as React from 'react';
import CommandService from '@joplinapp/lib/services/CommandService';
import ToolbarBase from '../../../ToolbarBase';
import { utils as pluginUtils } from '@joplinapp/lib/services/plugins/reducer';
import { connect } from 'react-redux';
import { AppState } from '../../../../app';
import ToolbarButtonUtils, { ToolbarButtonInfo } from '@joplinapp/lib/services/commands/ToolbarButtonUtils';
import stateToWhenClauseContext from '@joplinapp/lib/services/commands/stateToWhenClauseContext';
const { buildStyle } = require('@joplinapp/lib/theme');

interface ToolbarProps {
	themeId: number,
	toolbarButtonInfos: ToolbarButtonInfo[],
}

function styles_(props:ToolbarProps) {
	return buildStyle('CodeMirrorToolbar', props.themeId, () => {
		return {
			root: {
				flex: 1,
				marginBottom: 0,
			},
		};
	});
}

const toolbarButtonUtils = new ToolbarButtonUtils(CommandService.instance());

function Toolbar(props:ToolbarProps) {
	const styles = styles_(props);
	return <ToolbarBase style={styles.root} items={props.toolbarButtonInfos} />;
}

const mapStateToProps = (state: AppState) => {
	const whenClauseContext = stateToWhenClauseContext(state);

	const commandNames = [
		'historyBackward',
		'historyForward',
		'toggleExternalEditing',
		'-',
		'textBold',
		'textItalic',
		'-',
		'textLink',
		'textCode',
		'attachFile',
		'-',
		'textBulletedList',
		'textNumberedList',
		'textCheckbox',
		'textHeading',
		'textHorizontalRule',
		'insertDateTime',
		'toggleEditors',
	].concat(pluginUtils.commandNamesFromViews(state.pluginService.plugins, 'editorToolbar'));

	return {
		toolbarButtonInfos: toolbarButtonUtils.commandsToToolbarButtons(commandNames, whenClauseContext),
	};
};

export default connect(mapStateToProps)(Toolbar);

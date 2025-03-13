import { Vue } from '../NodeModule.js'

// 'cc-query-input', './component/input/query-input.vue',
// 'cc-input-box-fix', './component/input/input-box-fix.vue',
// 'cc-input-box-grid', './component/input/input-box-grid.vue',
// 'cc-query', './component/input/query-input-group.vue',
// 'cc-page', './component/content/page-init.vue',
// 'cc-tag-group', './component/content/tag-group.vue',
// 'cc-button', './component/system/button/button.vue',
// 'cc-button-link', './component/button/button-link.vue',
// 'cc-tree', './component/element/tree.vue',
// 'cc-tag', './component/element/tag.vue',
// 'cc-pagin', './component/element/pagin.vue',
// 'cc-button-group', './component/element/button-group.vue',
// 'cc-button-auth', './component/element/button-auth.vue',
// 'cc-dialog-edit', './component/element/dialog-edit/dialog-edit-s1.vue',
// 'cc-dialog-show', './component/element/dialog-edit/dialog-show.vue',
// 'cc-dialog', './component/element/dialog.vue',
// 'cc-table', './component/element/table.vue',
// 'cc-table-column', './component/element/table-column.vue',
// 'cc-select-single', './component/input/select-single.vue',
// 'cc-select-multi', './component/input/select-multi.vue',
// 'cc-select-level', './component/input/select-level.vue',
// 'cc-auth', './component/element/auth.vue',

// 业务相关组件
// 'cc-comcode-dialog', './component/service/comcode-dialog.vue',
// 'cc-packet-dialog', './component/service/packet-dialog.vue',

// 页面子组件 src\main\resources\templates\admin\page\verifyConfig\verfiyConfigDialog.vue
// 'cc-dialog-verify-config': './page/verifyConfig/verifyConfigDialog.vue',

// // 页面组件
// 'cc-param-page': './page/param.vue',

import Input from '@/component/input/input.vue';
Vue.component('cc-input', Input);

import ShowText from '@/component/input/show-text.vue';
Vue.component('cc-show-text', ShowText);

import LabelInput from '@/component/input/label-input/label-input.vue';
Vue.component('cc-label-input', LabelInput);

import Label from '@/component/input/label-input/label.vue';
Vue.component('cc-label', Label);

import EditorTextarea from '@/component/input/editor-textarea.vue';
Vue.component('cc-editor-textarea', EditorTextarea);

import EditorAce from '@/component/input/editor-ace.vue';
Vue.component('cc-editor-ace', EditorAce);

import InputTest from '@/component/input/input-test.vue';
Vue.component('cc-input-test', InputTest);

import QueryInput from '@/component/input/query-input.vue';
Vue.component('cc-query-input', QueryInput);

import QueryInput2 from '@/component/input/query-input-model.vue';
Vue.component('cc-query-input2', QueryInput2);

import InputBoxFix from '@/component/input/input-box-fix.vue';
Vue.component('cc-input-box-fix', InputBoxFix);

import InputBoxGrid from '@/component/input/input-box-grid.vue';
Vue.component('cc-input-box-grid', InputBoxGrid);

import InputGroup from '@/component/input/query-input-group.vue';
Vue.component('cc-query', InputGroup);

import Br from '@/component/content/br.vue';
Vue.component('cc-br', Br);

import Row from '@/component/content/layout/row.vue';
Vue.component('cc-row', Row);

import Col from '@/component/content/layout/col.vue';
Vue.component('cc-col', Col);

import LayoutForm from '@/component/content/layout/layout-form.vue';
Vue.component('cc-layout-form', LayoutForm);

import PageInit from '@/component/content/page-init.vue';
Vue.component('cc-page', PageInit);

import Debug from '@/component/content/debug.vue'
Vue.component('cc-debug', Debug);

import TagGroup from '@/component/content/tag-group.vue';
Vue.component('cc-tag-group', TagGroup);

import Menu from '@/component/element/menu.vue'
Vue.component('cc-menu', Menu);

import MenuPure from '@/component/element/menu-pure/menu-pure.vue'
Vue.component('cc-menu-pure', MenuPure);

import MenuPureV2 from '@/component/element/menu-pure/menu-pure-tree.vue'
Vue.component('cc-menu-pure-v2', MenuPureV2);

import MenuSon from '@/component/element/menu-son.vue'
Vue.component('cc-menu-son', MenuSon);

import MenuAndTagVue from '@/component/element/menu-and-tag.vue'
Vue.component('cc-menu-and-tag', MenuAndTagVue);

import Button from '@/component/system/button/button.vue';
Vue.component('cc-button', Button);

import ButtonLink from '@/component/system/button/button-link.vue';
Vue.component('cc-button-link', ButtonLink);

import Tree from '@/component/element/tree.vue';
Vue.component('cc-tree', Tree);

import Tag from '@/component/element/tag.vue';
Vue.component('cc-tag', Tag);

import HideText from '@/component/content/hide-text.vue';
Vue.component('cc-hide-text', HideText);

import Pagin from '@/component/element/pagin.vue';
Vue.component('cc-pagin', Pagin);

import ButtonGroup from '@/component/element/button-group.vue';
Vue.component('cc-button-group', ButtonGroup);

import queryButtonGroup from '@/component/element/query-button-group.vue';
Vue.component('cc-query-button', queryButtonGroup);

import ButtonAuth from '@/component/element/button-auth.vue';
Vue.component('cc-button-auth', ButtonAuth);

import DialogEdit from '@/component/element/dialog-edit/dialog-edit-s4.vue';
Vue.component('cc-dialog-edit', DialogEdit);

import DialogShow from '@/component/element/dialog-edit/dialog-show.vue';
Vue.component('cc-dialog-show', DialogShow);

import Dialog from '@/component/element/dialog.vue';
Vue.component('cc-dialog', Dialog);

import Table from '@/component-plus/element/table.vue';
Vue.component('cc-table', Table);

import InputGroupPlus from '@/component-plus/input/query-input-group.vue';
Vue.component('cc-query-plus', InputGroupPlus);

import TableColumn from '@/component/element/table-column/table-column.vue';
Vue.component('cc-table-column', TableColumn);

import TableColumnWrap from '@/component/element/table-column/table-column-wrap.vue';
Vue.component('cc-table-wrap', TableColumnWrap);

import TableColumnPopover from '@/component/element/table-column/table-column-popover.vue';
Vue.component('cc-table-popover', TableColumnPopover);
// import TableColumn from '@/component/element/table-column.vue';
// Vue.component('cc-table-column', TableColumn);

import TableExtend from '@/component/element/table-column/table-extend.vue';
Vue.component('cc-table-extend', TableExtend);

import TableOther from '@/component/element/table-column/table-other.vue';
Vue.component('cc-table-other', TableOther);

import SelectSingle from '@/component/input/select-single.vue';
Vue.component('cc-select-single', SelectSingle);

import SelectRadio from '@/component/input/select-radio.vue';
Vue.component('cc-select-radio', SelectRadio);

import SelectMulti from '@/component/input/select-multi.vue';
Vue.component('cc-select-multi', SelectMulti);

import SelectLevel from '@/component/input/select-level.vue';
Vue.component('cc-select-level', SelectLevel);

import SelectAuto from '@/component/input/select-auto.vue';
Vue.component('cc-select-auto', SelectAuto);

import SelectArea from '@/component/service/select-area.vue';
Vue.component('cc-select-area', SelectArea);

import SelectCity from '@/component/service/select-city.vue';
Vue.component('cc-select-city', SelectCity);

import Checkbox from '@/component/input/checkbox.vue';
Vue.component('cc-checkbox', Checkbox);

import Auth from '@/component/element/auth.vue';
Vue.component('cc-auth', Auth);

import ComcodeDialog from '@/component/service/comcode-dialog.vue'
Vue.component('cc-comcode-dialog', ComcodeDialog);

import ComcodeDialogMulti from '@/component/service/comcode-dialog-multi.vue'
Vue.component('cc-comcode-dialog-multi', ComcodeDialogMulti);

import PacketDialog from '@/component/service/packet-dialog.vue'
Vue.component('cc-packet-dialog', PacketDialog);

import PacketAceDialog from '@/component/service/packet-ace-dialog.vue'
Vue.component('cc-packet-ace-dialog', PacketAceDialog);

import PacketContent from '@/component/service/packet-content.vue'
Vue.component('cc-packet-content', PacketContent);

import AuthBind from '@/component/service/auth-bind.vue';
Vue.component('auth-bind', AuthBind);

import AuthButton from '@/component/service/auth-button.vue';
Vue.component('auth-button', AuthButton);

import InputMulti from '@/component/input/input-multi.vue'
Vue.component('cc-input-multi', InputMulti);

import InputMap from '@/component/input/input-map.vue'
Vue.component('cc-input-map', InputMap);

import InputJson from '@/component/input/input-json.vue'
Vue.component('cc-input-json', InputJson);

import InputTable from '@/component/input/input-table.vue'
Vue.component('cc-input-table', InputTable);

import InputTableField from '@/component/input/input-table-field.vue'
Vue.component('cc-input-table-field', InputTableField);

import InputAce from '@/component/input/input-ace.vue'
Vue.component('cc-input-ace', InputAce);

import SqlButton from '@/component/lowcode/sql-button.vue'
Vue.component('ee-sql-button', SqlButton);

import DebugHeader from '@/component/lowcode/debug-header.vue'
Vue.component('ee-debug-header', DebugHeader);

import DebugBox from '@/component/lowcode/debug-box.vue'
Vue.component('debug-box', DebugBox);

import DebugData from '@/component/lowcode/debug-data.vue'
Vue.component('ee-debug-data', DebugData);

import DocWrap from '@/component/lowcode/doc-wrap.vue'
Vue.component('doc-wrap', DocWrap);

import DocCard from '@/component/lowcode/doc-card.vue'
Vue.component('doc-card', DocCard);

import BDiv from '@/component/lowcode/b-div.vue'
Vue.component('b-div', BDiv);

import Markdown from '@/component/content/markdown.vue'
Vue.component('cc-markdown', Markdown);

import ImageTag from '@/component/content/image-tag.vue'
Vue.component('cc-image-tag', ImageTag);

import DiffView from '@/component/other/diff-view.vue'
Vue.component('cc-diff-view', DiffView);

import UploadPic from '@/component/other/uploadPic.vue'
Vue.component('cc-upload-pic', UploadPic );

import RightMenu from '@/component/other/purecss/right-menu/right-menu.vue'
Vue.component('cc-right-menu', RightMenu );

export default {
    log() {
        console.log('[Component init] init success.');
    },
}
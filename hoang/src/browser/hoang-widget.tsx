import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
// import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MenuPath, MessageService, nls } from '@theia/core';
import { codicon, CompositeTreeNode, ContextMenuRenderer, ExpandableTreeNode, LabelProvider, Message, NodeProps, TREE_NODE_CONTENT_CLASS, TREE_NODE_SEGMENT_CLASS, TreeModel, TreeNode, TreeProps, TreeWidget } from '@theia/core/lib/browser';
import { FirstStepDialog } from './step1-dialog';
import { TriggerNode } from './common/ui-interface';
import { TriggerConfig, MControl, ICount } from './common/trigger-interface';
import Tooltip from '@mui/material/Tooltip';

export interface Trigger extends TreeNode {
    children: TriggerNode[];
}

export namespace TriggerTree {
    export type RootNode = Trigger;
    export namespace RootNode {
        export function is(node: TreeNode): node is RootNode {
            return !!node;
        }
    }
}

const TRIGGER_MOCK_DATA: TriggerConfig[] = [
    {
        name: "Trigger 1",
        id: "d83530a5-e784-4942-b4bb-69d204ff5526",
        isEnable: true,
        triggerType: "mcontrol",
        tdata2: "0x20",
        mcontrolType: "load",
        tdata1: {
            type: 2,
            dmode: true,
            maskmax: "0",
            hit: 0,
            select: true,
            timing: true,
            sizelo: "0",
            sizehi: "0",
            action: "1",
            match: "0",
            chain: true,
            m: true,
            s: true,
            u: true,
            execute: false,
            store: false,
            load: true
        }
    },
    {
        name: "Trigger 2",
        id: "05aa33e1-6332-464e-bf76-49cee755bd6d",
        isEnable: true,
        triggerType: "mcontrol",
        tdata2: "0x30",
        mcontrolType: "load",
        tdata1: {
            type: 2,
            dmode: true,
            maskmax: "0",
            hit: 0,
            select: true,
            timing: true,
            sizelo: "0",
            sizehi: "0",
            action: "1",
            match: "0",
            chain: true,
            m: true,
            s: true,
            u: true,
            execute: false,
            store: false,
            load: true
        }
    },
    {
        name: "Trigger 3",
        id: "b36fc2df-b885-421b-88fa-f8c20a1b821b",
        isEnable: true,
        triggerType: "mcontrol",
        mcontrolType: "execute",
        tdata2: "0x100",
        tdata1: {
            type: 2,
            dmode: true,
            maskmax: "0",
            hit: 0,
            select: true,
            timing: true,
            sizelo: "0",
            sizehi: "0",
            action: "1",
            match: "0",
            chain: true,
            m: true,
            s: true,
            u: true,
            execute: false,
            store: true,
            load: false
        }
    },
    {
        name: "Trigger 4",
        id: "123e4567-e89b-12d3-a456-426614174000",
        isEnable: true,
        triggerType: "icount",
        tdata1: {
            type: 3,
            action: "switch to debug mode",
            count: 1,
            dmode: true,
            m: true,
            s: true,
            u: true
        },
        tdata2: undefined
    }
];

export const RISCV_DEBUG_TRIGGER_CONTEXT_MENU: MenuPath = ['riscv-debug-trigger-context-menu'];

@injectable()
export class HoangWidget extends TreeWidget {

    static readonly ID = 'hoang:widget';
    static readonly LABEL = 'Hoang Widget';
    static readonly CONTEXT_MENU = RISCV_DEBUG_TRIGGER_CONTEXT_MENU;

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(FirstStepDialog)
    protected readonly demoDialog!: FirstStepDialog;

    public triggers = TRIGGER_MOCK_DATA;

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(TreeModel) override readonly model: TreeModel,
        @inject(ContextMenuRenderer) readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(LabelProvider) readonly labelProvider: LabelProvider,
    ) {
        super({ ...props, contextMenuPath: HoangWidget.CONTEXT_MENU }, model, contextMenuRenderer);
        this.title.iconClass = codicon('note');
        this.title.label = HoangWidget.LABEL;
        this.title.caption = HoangWidget.LABEL;
        this.title.closable = true;
        model.root = {
            id: HoangWidget.ID,
            name: HoangWidget.LABEL,
            parent: undefined,
            expanded: true,
            visible: false,
            children: []
        } as Trigger;
    }

    @postConstruct()
    protected init(): void {
        super.init();
        this.id = HoangWidget.ID;
        Promise.resolve(this.doInit()).catch(error => {
            console.error('Error during doInit:', error);
        });
    }

    protected async doInit(): Promise<void> {
        await this.refreshView();
    }

    public async refreshView(): Promise<void> {
        const settingsPath = 'default directory';

        if (this.model.root && TriggerTree.RootNode.is(this.model.root)) {
            this.model.root.children = await this.parseData(settingsPath);
        }

        this.model.refresh();
        this.update();
    }

    protected async parseData(settingsDir: string): Promise<TriggerNode[]> {
        const triggerNodes: TriggerNode[] = [];

        for (const trigger of this.triggers ?? []) {
            const triggerNode = await this.parseTrigger(trigger);
            triggerNode.parent = this.model.root;
            triggerNodes.push(triggerNode);
        }

        return triggerNodes;
    }

    protected async parseTrigger(trigger: TriggerConfig): Promise<TriggerNode> {
        const triggerNode = new TriggerNode(trigger);
        return triggerNode;
    }

    protected renderNodeRecursive(node: TreeNode, depth: number): React.ReactNode {
        if (!TreeNode.isVisible(node)) {
            return undefined;
        }

        const props = { depth };
        const nodeElement = this.renderNode(node, props);

        if (ExpandableTreeNode.is(node) && node.expanded && node.children) {
            const childrenElements = node.children.map(child =>
                this.renderNodeRecursive(child, depth + 1)
            );
            return [nodeElement, ...childrenElements];
        }

        return nodeElement; //  Return node not expand
    }

    // Override renderTree
    protected override renderTree(model: TreeModel): React.ReactNode {
        if (!model.root || !TriggerTree.RootNode.is(model.root)) {
            return <div className='xplor-widget-info'>{nls.localize('', 'Error while generating widget.')}</div>;
        }
        // if (!model.root.children || model.root.children.length === 0) {
        //     return <div className='xplor-widget-info'>{nls.localize('', 'There is no trigger in this project')}</div>;
        // }
        const nodes = (model.root as CompositeTreeNode).children.map(child =>
            this.renderNodeRecursive(child, 0)
        );
        return <div className="tree-container">{nodes}</div>;
    }

    protected override render(): React.ReactNode {
        return React.createElement('div', this.createContainerAttributes(), this.renderTree(this.model));
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const htmlElement = document.getElementById('displayMessageButton');
        if (htmlElement) {
            htmlElement.focus();
        }
    }

    protected override renderNode(node: TreeNode, props: NodeProps): React.ReactNode {
        if (!TreeNode.isVisible(node)) {
            return undefined;
        }
        const attributes = this.createNodeAttributes(node, props);
        const content = <div className={TREE_NODE_CONTENT_CLASS}>
            {this.decorateIcon(node, this.renderIcon(node, props))}
            {this.renderCheckbox(node, props)}
            {this.renderCaptionAffixes(node, props, 'captionPrefixes')}
            {this.renderCaption(node, props)}
            {this.renderCaptionAffixes(node, props, 'captionSuffixes')}
            {this.renderTailDecorations(node, props)}
            {this.renderUpdateButton(node, props)}
            {this.renderInfoButton(node, props)}
            {this.renderDeleteButton(node, props)}
        </div>;

        return React.createElement('div', attributes, content);
    }

    protected override createNodeAttributes(node: TreeNode, props: NodeProps): React.HTMLAttributes<HTMLElement> {
        const attributes = super.createNodeAttributes(node, props);
        
        // Add right-click (context menu) support
        attributes.onContextMenu = e => {
            e.preventDefault(); // prevent default browser menu

            // select the clicked node so commands know the context
            this.selectionService.selection = node;

            // render your custom context menu
            this.contextMenuRenderer.render({
                menuPath: HoangWidget.CONTEXT_MENU,
                anchor: { x: e.clientX, y: e.clientY },
                context: e.currentTarget
            });
        };

        return attributes;
    }

    protected override renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        return (
            <span
                className={`theia-debug-breakpoint-icon codicon codicon-debug-breakpoint ${(node as TriggerNode).triggerData.isEnable ? '' : '-disabled'}`}
                title={`Trigger: ${node.name}`}
            ></span>
        );
    }

    protected renderCheckbox(node: TreeNode, props: NodeProps): React.ReactNode {
        const isChecked = (node as TriggerNode).triggerData.isEnable;
        return (
            <input
                type="checkbox"
                checked={isChecked}
                onChange={async e => {
                    this.onCheckboxChange(e, node as TriggerNode);
                }}
                title={`Enable/Disable ${node.name}`}
            />
        );
    }



    protected renderInfoButton(node: TreeNode, props: NodeProps): React.ReactNode {
        const icon = codicon('info');
        const classNames = [TREE_NODE_SEGMENT_CLASS, 'xplor-trigger-button', icon];

        const triggerData = (node as TriggerNode).triggerData;

        const infoItems = [
            { label: 'ID', value: triggerData.id },
            { label: 'Name', value: triggerData.name },
            { label: 'Type', value: triggerData.triggerType },
            { label: 'Enabled', value: triggerData.isEnable ? 'Yes' : 'No' },
        ];

        if (triggerData.triggerType === 'mcontrol') {
            infoItems.push({ label: 'Match Control Type', value: triggerData.mcontrolType || 'N/A' });
        }

        // Define tdata1Items based on whether triggerData.tdata1 is MControl or ICount
        const tdata1Items = triggerData.triggerType === 'mcontrol' ? [
            { label: '- Action', value: triggerData.tdata1.action || 'N/A' },
            { label: '- Match', value: (triggerData.tdata1 as MControl).match || 'N/A' },
            { label: '- Sizehi', value: (triggerData.tdata1 as MControl).sizehi || 'N/A' },
            { label: '- Sizelo', value: (triggerData.tdata1 as MControl).sizelo || 'N/A' },
            { label: '- Maskmax', value: (triggerData.tdata1 as MControl).maskmax || 'N/A' },
            { label: '- Dmode', value: triggerData.tdata1.dmode ? 'Yes' : 'No' },
            { label: '- Timing', value: (triggerData.tdata1 as MControl).timing ? 'Yes' : 'No' },
            { label: '- Select', value: (triggerData.tdata1 as MControl).select ? 'Yes' : 'No' },
            { label: '- Chain', value: (triggerData.tdata1 as MControl).chain ? 'Yes' : 'No' },
            { label: '- Machine mode', value: triggerData.tdata1.m ? 'Yes' : 'No' },
            { label: '- Supervisor mode', value: triggerData.tdata1.s ? 'Yes' : 'No' },
            { label: '- User mode', value: triggerData.tdata1.u ? 'Yes' : 'No' },
        ] : [
            { label: '- Action', value: triggerData.tdata1.action || 'N/A' },
            { label: '- Count', value: (triggerData.tdata1 as ICount).count ?? 'N/A' },
            { label: '- Dmode', value: triggerData.tdata1.dmode ? 'Yes' : 'No' },
            { label: '- Machine mode', value: triggerData.tdata1.m ? 'Yes' : 'No' },
            { label: '- Supervisor mode', value: triggerData.tdata1.s ? 'Yes' : 'No' },
            { label: '- User mode', value: triggerData.tdata1.u ? 'Yes' : 'No' },
        ];

        return (
            <Tooltip
                title={
                    <div style={{ fontSize: 12, padding: '8px', maxWidth: 400, color: '#ffffff' }}>
                        {infoItems.map(item => (
                            <div key={item.label} style={{ marginBottom: 2 }}>
                                <strong>{item.label}:</strong> {item.value ?? 'N/A'}
                            </div>
                        ))}
                        <div style={{ margin: '4px 0', fontWeight: 'bold' }}>
                            Trigger Data 1
                        </div>
                        {tdata1Items.map(item => (
                            <div key={item.label} style={{ marginBottom: 2 }}>
                                <strong>{item.label}:</strong> {item.value}
                            </div>
                        ))}
                        <div style={{ marginTop: 4 }}>
                            <strong>Trigger Data 2:</strong> {triggerData.tdata2 ?? 'N/A'}
                        </div>
                    </div>
                }
                placement="top"
                arrow
            >
                <button
                    type="button"
                    className={classNames.join(' ')}
                    tabIndex={0}
                    aria-label={`Info ${(node as TriggerNode).name}`}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('Trigger data:', triggerData);
                    }}
                />
            </Tooltip>
        );
    }

    protected renderUpdateButton(node: TreeNode, props: NodeProps): React.ReactNode {
        const icon = codicon('edit');
        const classNames = [TREE_NODE_SEGMENT_CLASS, 'xplor-trigger-button', icon];

        return (
            <button
                type="button"
                className={classNames.join(' ')}
                title={`Update ${(node as TriggerNode).name}`}
                tabIndex={0}
                onClick={async e => await this.onUpdateButtonClick(e, node as TriggerNode)}
                aria-label={`Update ${(node as TriggerNode).name}`}
            />
        );
    }

    protected renderDeleteButton(node: TreeNode, props: NodeProps): React.ReactNode {
        const icon = codicon('close');
        const classNames = [TREE_NODE_SEGMENT_CLASS, 'xplor-trigger-button', icon];

        return (
            <button
                type="button"
                className={classNames.join(' ')}
                title={`Delete ${(node as TriggerNode).name}`}
                tabIndex={0}
                onClick={async e => await this.onClearButtonClick(e, node as TriggerNode)}
                aria-label={`Delete ${(node as TriggerNode).name}`}
            />
        );
    }

    private onCheckboxChange(e: React.ChangeEvent<HTMLInputElement>, node: TriggerNode): void {
        e.stopPropagation();
        e.preventDefault();

        // Implement the logic to enable/disable the trigger here
        const isChecked = e.target.checked;
        node.triggerData.isEnable = isChecked;

        this.messageService.info(`Trigger ${node.name} is now ${isChecked ? 'enabled' : 'disabled'}`);
    }

    private async onUpdateButtonClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: TriggerNode): Promise<void> {
        e.stopPropagation();
        e.preventDefault();

        const index = this.triggers.findIndex(t => t.id === node.triggerData.id);
        if (index === -1) {
            this.messageService.warn(`Trigger "${node.name}" not found.`);
            return;
        }

        const updatedTrigger = await this.demoDialog.openWithData(node.triggerData);

        if (updatedTrigger) {
            this.triggers[index] = {
                ...this.triggers[index],
                ...updatedTrigger
            };

            await this.refreshView();

            this.messageService.info(`Trigger "${updatedTrigger.name}" updated.`);
        }
    }

    private async onClearButtonClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: TriggerNode): Promise<void> {
        e.stopPropagation();
        e.preventDefault();

        const index = this.triggers.findIndex(t => t.id === node.triggerData.id);

        if (index !== -1) {
            this.triggers.splice(index, 1);
            await this.refreshView();
            this.messageService.info(`Trigger "${node.name}" deleted (index: ${index})`);
        } else {
            this.messageService.warn(`Trigger "${node.name}" not found`);
        }
    }

}

import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
// import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MenuPath, MessageService, nls } from '@theia/core';
import { codicon, CompositeTreeNode, ContextMenuRenderer, ExpandableTreeNode, LabelProvider, Message, NodeProps, TREE_NODE_CONTENT_CLASS, TREE_NODE_SEGMENT_CLASS, TreeModel, TreeNode, TreeProps, TreeWidget } from '@theia/core/lib/browser';
import { DemoDialog } from './step2-dialog';
import { TriggerNode } from './common/ui-interface';
import { TriggerConfig } from './common/trigger-interface';

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
            maskmax: 0,
            hit: 0,
            select: true,
            timing: 0,
            sizelo: 0,
            sizehi: 0,
            action: 1,
            match: 0,
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
            maskmax: 0,
            hit: 0,
            select: true,
            timing: 0,
            sizelo: 0,
            sizehi: 0,
            action: 1,
            match: 0,
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
            maskmax: 0,
            hit: 0,
            select: true,
            timing: 0,
            sizelo: 0,
            sizehi: 0,
            action: 1,
            match: 0,
            m: true,
            s: true,
            u: true,
            execute: false,
            store: true,
            load: false
        }
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

    @inject(DemoDialog)
    protected readonly demoDialog!: DemoDialog;

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
        const triggers = TRIGGER_MOCK_DATA; // Replace with actual data fetching logic

        for (const trigger of triggers ?? []) {
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
        if (!model.root.children || model.root.children.length === 0) {
            return <div className='xplor-widget-info'>{nls.localize('', 'There is no trigger in this project')}</div>;
        }
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

    protected renderUpdateButton(node: TreeNode, props: NodeProps): React.ReactNode {
        const icon = codicon('settings-gear');
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

    protected renderInfoButton(node: TreeNode, props: NodeProps): React.ReactNode {
        const icon = codicon('info');
        const classNames = [TREE_NODE_SEGMENT_CLASS, 'xplor-trigger-button', icon];

        return (
            <button
                type="button"
                className={classNames.join(' ')}
                title={`Info ${(node as TriggerNode).name}`}
                tabIndex={0}
                onClick={async e => await this.onInfoButtonClick(e, node as TriggerNode)}
                aria-label={`Info ${(node as TriggerNode).name}`}
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

        // Implement the logic to clear the trigger here
        this.messageService.info(`Update ${node.name}`);
    }

    private async onInfoButtonClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: TriggerNode): Promise<void> {
        e.stopPropagation();
        e.preventDefault();

        // Implement the logic to clear the trigger here
        this.messageService.info(`Info ${node.name}`);
    }

    private async onClearButtonClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: TriggerNode): Promise<void> {
        e.stopPropagation();
        e.preventDefault();

        // Implement the logic to clear the trigger here
        this.messageService.info(`Delete ${node.name}`);
    }

}

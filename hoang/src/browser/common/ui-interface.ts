import { TreeNode } from "@theia/core/lib/browser";
import { WidgetDecoration } from "@theia/core/lib/browser/widget-decoration";
import { TriggerConfig } from "./trigger-interface";



export interface ModelDecorationData extends WidgetDecoration.Data {
    // backgroundColor?: string;
    captionSuffixes?: WidgetDecoration.CaptionAffix[];
}

export const descriptionFontData: WidgetDecoration.FontData = {
    style: 'normal',
    color: '#9d9d9d',
};

export abstract class BaseNode {
    public expanded: boolean;
    public visible: boolean;
    public selected: boolean;

    constructor(public parent?: BaseNode | TreeNode) {
        this.expanded = false;
        this.visible = true;
        this.selected = false;
    }
}

export class TriggerNode extends BaseNode {
    public readonly id: string;
    public readonly name: string;
    public status!: string;
    public readonly description!: string;
    public readonly triggerData: TriggerConfig;
    public decorationData!: ModelDecorationData;

    constructor(options: TriggerConfig) {
        super();
        this.id = crypto.randomUUID();
        this.name = `${options.name}`;
        this.expanded = false;
        this.triggerData = options;
    }

    public updateStatus(status: string) {
        this.status = status;
        this.decorationData = {
            captionSuffixes: [
                {
                    data: this.status ?? ``,
                    fontData: descriptionFontData
                }
            ]
        };
    }

    public resetStatus() {
        this.status = ``;
        this.decorationData = {
            captionSuffixes: []
        };
    }
}
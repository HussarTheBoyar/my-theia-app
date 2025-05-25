import { MessageService } from '@theia/core';
import { DialogProps, Message } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';

import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { SecondStepDialog } from './step2-dialog';
import { TriggerConfig } from './common/trigger-interface';

@injectable()
export class FirstStepDialogProps extends DialogProps {}

interface DialogState {
  triggerName: string;
  triggerType: string;
}

@injectable()
export class FirstStepDialog extends ReactDialog<TriggerConfig> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  @inject(SecondStepDialog)
  protected readonly secondStepDialog: SecondStepDialog;

  private finalConfig?: TriggerConfig;

  private static persistedState: DialogState = {
    triggerName: '',
    triggerType: '',
  };

  private state: DialogState;
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor(
    @inject(DialogProps) protected readonly props: DialogProps
  ) {
    super(props);
    this.state = { ...FirstStepDialog.persistedState };
    this.appendAcceptButton('Create');
    this.appendCloseButton('Cancel');

    this.handleChange = this.handleChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  get value(): TriggerConfig {
    return this.finalConfig ?? {
      name: this.state.triggerName,
      id: '',
      isEnable: true,
      triggerType: this.state.triggerType as 'mcontrol' | 'icount' | 'itrigger' | 'etrigger',
      tdata1: {} as any,
    };
  }

  protected handleChange(event: SelectChangeEvent): void {
    const newState = { ...this.state, triggerType: event.target.value as string };
    this.state = newState;
    FirstStepDialog.persistedState = { ...this.state };
    this.update();
  }

  private readonly handleTextChange: (key: keyof DialogState) => (event: React.ChangeEvent<HTMLInputElement>) => void = (key) => (event) => {
    const newValue = event.target.value;
    this.state = { ...this.state, [key]: newValue };

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      FirstStepDialog.persistedState = { ...this.state };
      this.update();
    }, 300);
  };

  protected render(): React.ReactNode {
    const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
    if (loaderLine) {
      loaderLine.classList.remove('xplor-ide-loader-line');
    }

    const FormGrid = styled(Grid)(() => ({
      display: 'flex',
      flexDirection: 'column',
    }));
    

    return (
      <div
        className="xplor-ide-dialog xplor-ide-grid-container"
        style={{ minWidth: '500px', padding: '28px', backgroundColor: 'none', color: '#ffffff' }}
        id="xplor-ide-create-project-dialog"
      >
        <Grid container spacing={3} flexDirection={'column'}>
          <FormGrid>
            <FormLabel
              htmlFor="trigger-name"
              className="title-form"
              required
              sx={{ color: '#ffffff', marginBottom: '3px' }}
            >
              Trigger name
            </FormLabel>
            <OutlinedInput
              id="trigger-name"
              name="trigger-name"
              type="text"
              placeholder="Enter trigger name"
              value={this.state.triggerName}
              onChange={this.handleTextChange('triggerName')}
              required
              size="small"
              className="input-text"
              sx={{
                backgroundColor: '#41414C',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'none' },
              }}
            />
          </FormGrid>
          <FormGrid>
            <FormLabel
              htmlFor="trigger-name"
              className="title-form"
              required
              sx={{ color: '#ffffff', marginBottom: '3px' }}
            >
              Trigger type
            </FormLabel>
          <FormControl fullWidth>
            <InputLabel
              id="demo-label"
              sx={{ color: '#ffffff', top: '-9px' }}
            >
              Choose trigger type
            </InputLabel>
            <Select
              labelId="demo-label"
              value={this.state.triggerType}
              label="Choose trigger type"
              onChange={this.handleChange}
              size="small"
              sx={{
                backgroundColor: '#41414C',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'none' },
                '& .MuiSelect-icon': { color: '#ffffff' },
              }}
            >
              <MenuItem className="menu-item" value="">Select type</MenuItem>
              <MenuItem value="mcontrol">mcontrol</MenuItem>
              <MenuItem value="icount">icount</MenuItem>
              <MenuItem value="itrigger">itrigger</MenuItem>
              <MenuItem value="etrigger">etrigger</MenuItem>
            </Select>
          </FormControl>
          </FormGrid>
        </Grid>
      </div>
    );
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.update();
  }

  @postConstruct()
  protected init(): void {
    this.title.label = 'Create a new project';
    this.state = { ...FirstStepDialog.persistedState };
    this.update();
  }

  public async openWithData(trigger: TriggerConfig, isEdit = true): Promise<TriggerConfig | undefined> {
    this.state = {
        triggerName: trigger.name,
        triggerType: trigger.triggerType
    };
    FirstStepDialog.persistedState = { ...this.state };
    this.title.label = isEdit ? 'Edit Trigger' : 'Create Trigger';
    this.update();

    return super.open();
  }

  protected override async accept(): Promise<void> {
    const config = await this.secondStepDialog.open();

    if (config) {
      // Save the result from second dialog
      this.finalConfig = {
        ...config,
        name: this.state.triggerName,
        triggerType: this.state.triggerType as any,
      };
    }
    console.log('Final Trigger Config:', this.finalConfig);

    super.accept();
  }

  public override close(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    super.close();
  }
}
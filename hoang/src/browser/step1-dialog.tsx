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

@injectable()
export class DemoDialogProps extends DialogProps {}

interface DialogState {
  age: string;
  triggerName: string;
  triggerType: string;
}

@injectable()
export class DemoDialog extends ReactDialog<void> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  private static persistedState: DialogState = {
    age: '',
    triggerName: '',
    triggerType: '',
  };

  private state: DialogState;
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor(
    @inject(DialogProps) protected readonly props: DialogProps
  ) {
    super(props);
    this.state = { ...DemoDialog.persistedState };
    this.appendAcceptButton('Create');
    this.appendCloseButton('Cancel');

    this.handleChange = this.handleChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  get value(): void {
    return;
  }

  protected handleChange(event: SelectChangeEvent): void {
    const newState = { ...this.state, age: event.target.value as string };
    this.state = newState;
    DemoDialog.persistedState = { ...this.state };
    this.update();
  }

  private readonly handleTextChange: (key: keyof DialogState) => (event: React.ChangeEvent<HTMLInputElement>) => void = (key) => (event) => {
    const newValue = event.target.value;
    this.state = { ...this.state, [key]: newValue };

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      DemoDialog.persistedState = { ...this.state };
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
        style={{ minWidth: '500px', padding: '16px', backgroundColor: '#1e2527', color: '#ffffff' }}
        id="xplor-ide-create-project-dialog"
      >
        <Grid container spacing={3} flexDirection={'column'}>
          <FormGrid>
            <FormLabel
              htmlFor="trigger-name"
              className="title-form"
              required
              sx={{ color: '#ffffff', marginBottom: '8px' }}
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
                backgroundColor: '#2d3537',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
              }}
            />
          </FormGrid>
          <FormControl fullWidth>
            <InputLabel
              id="demo-label"
              sx={{ color: '#ffffff' }}
            >
              Choose trigger type
            </InputLabel>
            <Select
              labelId="demo-label"
              value={this.state.age}
              label="Choose trigger type"
              onChange={this.handleChange}
              sx={{
                backgroundColor: '#2d3537',
                color: '#ffffff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                '& .MuiSelect-icon': { color: '#ffffff' },
              }}
            >
              <MenuItem className="menu-item" value="">Select type</MenuItem>
              <MenuItem value="ten">Ten</MenuItem>
              <MenuItem value="twenty">Twenty</MenuItem>
              <MenuItem value="thirty">Thirty</MenuItem>
            </Select>
          </FormControl>
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
    this.state = { ...DemoDialog.persistedState };
    this.update();
  }

  protected override async accept(): Promise<void> {
    this.messageService.info('Accepted');
    super.accept();
  }

  public override close(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    super.close();
  }
}

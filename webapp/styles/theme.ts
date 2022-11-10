import { deepmerge } from '@mui/utils';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {
  experimental_extendTheme as extendMuiTheme,
  PaletteColor,
  TypeText,
  TypeAction,
  TypeBackground,
  CommonColors,
  Overlays,
  PaletteColorChannel,
  PaletteAlert,
  PaletteAppBar,
  PaletteAvatar,
  PaletteChip,
  PaletteFilledInput,
  PaletteLinearProgress,
  PaletteSlider,
  PaletteSkeleton,
  PaletteSnackbarContent,
  PaletteSpeedDialAction,
  PaletteStepConnector,
  PaletteStepContent,
  PaletteSwitch,
  PaletteTableCell,
  PaletteTooltip,
  Shadows,
  ZIndex,
} from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { extendTheme as extendJoyTheme } from '@mui/joy/styles';
import {
  Theme as JoyTheme,
  ThemeCssVar as JoyThemeCssVar,
} from '@mui/joy/styles';

// extends Joy theme to include tokens from Material UI
declare module '@mui/joy/styles' {
  interface Palette {
    secondary: PaletteColorChannel;
    error: PaletteColorChannel;
    dividerChannel: string;
    action: TypeAction;
    Alert: PaletteAlert;
    AppBar: PaletteAppBar;
    Avatar: PaletteAvatar;
    Chip: PaletteChip;
    FilledInput: PaletteFilledInput;
    LinearProgress: PaletteLinearProgress;
    Skeleton: PaletteSkeleton;
    Slider: PaletteSlider;
    SnackbarContent: PaletteSnackbarContent;
    SpeedDialAction: PaletteSpeedDialAction;
    StepConnector: PaletteStepConnector;
    StepContent: PaletteStepContent;
    Switch: PaletteSwitch;
    TableCell: PaletteTableCell;
    Tooltip: PaletteTooltip;
  }
  type PalettePrimary = PaletteColor;
  type PaletteInfo = PaletteColor;
  type PaletteSuccess = PaletteColor;
  type PaletteWarning = PaletteColor;
  type PaletteCommon = CommonColors;
  type PaletteText = TypeText;
  type PaletteBackground = TypeBackground;

  interface ThemeVars {
    // attach to Joy UI `theme.vars`
    shadows: Shadows;
    overlays: Overlays;
    zIndex: ZIndex;
  }
}

type MergedThemeCssVar = { [k in JoyThemeCssVar]: true };

declare module '@mui/material/styles' {
  interface Theme {
    // put everything back to Material UI `theme.vars`
    vars: JoyTheme['vars'];
  }

  // makes Material UI theme.getCssVar() sees Joy theme tokens
  type ThemeCssVarOverrides = MergedThemeCssVar;
}

const makeTheme = (color: string) => {
  const palette = {
    primary: { main: color },
    secondary: {
      main: '#00d103',
    },
    neutral: {
      main: '#d8d3ff',
      dark: '#aea4fe',
      contrastText: '#fff',
    },
    background: {
      paper: '#383742',
      default: '#0f0f0e',
    },
  };
  const muiTheme = extendMuiTheme({
    colorSchemes: {
      light: { palette },
      dark: { palette },
    },
  });
  const joyTheme = extendJoyTheme({
    cssVarPrefix: 'mui',
    colorSchemes: {
      light: {
        palette: {
          primary: {
            solidDisabledColor:
              'rgba(var(--mui-palette-primary-mainChannel) / 0.7)',
            softColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
            softBg: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
            solidColor: 'var(--mui-palette-primary-contrastText)',
            solidBg: 'var(--mui-palette-primary-main)',
            solidHoverBg: 'var(--mui-palette-primary-dark)',
            plainColor: 'var(--mui-palette-primary-main)',
            plainHoverBg:
              'rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))',
            plainActiveBg: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
            outlinedBorder:
              'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
            outlinedColor: 'var(--mui-palette-primary-main)',
            outlinedHoverBg:
              'rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))',
            outlinedHoverBorder: 'var(--mui-palette-primary-main)',
            outlinedActiveBg:
              'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
          },
          neutral: {
            ...grey,
          },
          divider: 'var(--mui-palette-divider)',
        },
      },
      dark: {
        palette: {
          primary: {
            solidDisabledColor:
              'rgba(var(--mui-palette-primary-mainChannel) / 0.7)',
            softColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
            softBg: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
            solidColor: 'var(--mui-palette-primary-contrastText)',
            solidBg: 'var(--mui-palette-primary-main)',
            solidHoverBg: 'var(--mui-palette-primary-dark)',
            plainColor: 'var(--mui-palette-primary-main)',
            plainHoverBg:
              'rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))',
            plainActiveBg: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
            outlinedBorder:
              'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
            outlinedColor: 'var(--mui-palette-primary-main)',
            outlinedHoverBg:
              'rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))',
            outlinedHoverBorder: 'var(--mui-palette-primary-main)',
            outlinedActiveBg:
              'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
          },
          neutral: {
            ...grey,
          },
          divider: 'var(--mui-palette-divider)',
          text: {
            tertiary: 'rgba(255 255 255 / 0.5)',
          },
        },
      },
    },
    shadow: {
      xs: `var(--mui-shadowRing), ${muiTheme.shadows[1]}`,
      sm: `var(--mui-shadowRing), ${muiTheme.shadows[2]}`,
      md: `var(--mui-shadowRing), ${muiTheme.shadows[4]}`,
      lg: `var(--mui-shadowRing), ${muiTheme.shadows[8]}`,
      xl: `var(--mui-shadowRing), ${muiTheme.shadows[12]}`,
    },
  });
  const theme = deepmerge(joyTheme, muiTheme);
  return theme;
};
export default (color: string) => {
  return makeTheme(color);
};

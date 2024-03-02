import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { locationService } from "@grafana/runtime";
import { IconButton, useStyles2 } from "@grafana/ui";
import React, { CSSProperties, useCallback, useEffect, useState } from "react";

import history from 'history'

import ReactDOM from 'react-dom/client'

type Props = {};

const DONT_MOVE_BUTTON = false;

const firstLocation = locationService.getHistory().location;

export function GlobalFloater(props: Props) {

  const styles = useStyles2(getStyles);
  const [mouseDown, setMouseDown] = useState(false);
  const [position, setPosition] = useState<[number, number]>()
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const [locations, setLocations] = useState<history.Update[]>([]);

  const toggleDrawer = useCallback(()=>setDrawerOpen(!isDrawerOpen), [setDrawerOpen, isDrawerOpen]);

  useEffect(()=>{
    const unsubscribe = locationService.getHistory().listen((update: history.Update)=>{
      setLocations([...locations, update]);
    })

    return unsubscribe;

  }, [locations, setLocations])

  useEffect(()=>{

    // Press d followed by b to open docbooks

    let prevKey = 'x';
    let prevTime = Number.NaN;

    const handleKeyDown = (e: KeyboardEvent) => {

      if (e.target instanceof HTMLElement) {
        if (e.target.tagName === 'input') {
          console.log("REJECTED TARGET", e.target)
          return;
        }
      }


      const deltaTime = e.timeStamp - prevTime;

      if (prevKey === 'd' && e.key === 'b' && deltaTime < 1000) {
        setDrawerOpen(true);
      }

      prevKey = e.key;
      prevTime = e.timeStamp;

    };
      document.addEventListener('keydown', handleKeyDown, true);
    
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };

  }, [setDrawerOpen]);
  
  useEffect(()=>{
    console.log("MOUSE IS DOWN", mouseDown)

    

    if (mouseDown && !DONT_MOVE_BUTTON) {
      function mouseHandler(e: MouseEvent) {
        console.log(e);
        setPosition([e.pageX, e.pageY]);
      }
      document.addEventListener('mousemove', mouseHandler)

      return ()=>document.removeEventListener('mousemove', mouseHandler);
    }

    return;

  }, [mouseDown])




  const styleOverride: CSSProperties = isDrawerOpen ? {} : {width: 0}

  const positionOverride: CSSProperties = {};

  if (position) {
    let [x, y] = position;
    positionOverride.left = x;
    positionOverride.top = y;
    positionOverride.bottom = 'revert';
    positionOverride.right = 'revert';
  }

  return <div>
    <div className={styles.drawer} style={styleOverride}>
      <div className={styles.drawerContents}>

        <h1>Team name here</h1>
        Doc books
          
        <h2>Your first location</h2>
        <ul>
          <li>{JSON.stringify(firstLocation)}</li>
        </ul>

        <h2>Where else have you been?</h2>
        <ul>
          {locations.map((update, i) => <li key={i} className={styles.locationItem}>{JSON.stringify(update)}</li>)}
        </ul>

      </div>
    </div>
    
    <IconButton style={positionOverride} onMouseDown={(e)=>e.button === 0 && setMouseDown(true)} onMouseUp={(e)=> e.button === 0 && setMouseDown(false)} className={styles.floater} aria-label="Open run book" size="xxxl" tooltip={'Run books'} variant="primary" name={'book-open'} onClick={toggleDrawer}>Run Books</IconButton>
  </div>


}


function getStyles(theme: GrafanaTheme2) {

  const drawerWidth = theme.spacing(64);

  return ({
    drawer: css({
      width: drawerWidth,
      height: '100%',
      transition: "width 0.2s ease-in-out",
      // background: theme.colors.background.primary,
      // borderLeft: `solid 1px ${theme.colors.border.strong}`,
    }),
    locationItem: css({
      ... theme.typography.bodySmall
    }),
    drawerContents: css({
      width: drawerWidth,
      margin: theme.spacing(1),
    }),
    floater: css({
      borderRadius: '100%',
      // background: theme.colors.info.main,
      // width: theme.spacing(4),
      // height: theme.spacing(4),
      // transition: theme.transitions.easing.easeInOut,
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
      zIndex: 1000, // Under drawer, but above Grafana
      // border: `solid ${theme.spacing(1)} ${theme.colors.border.strong}`,
      // ':hover': {
      //   borderWidth: theme.spacing(2),
      //   background: theme.colors.info.border        
      // }

    })
  });
}



export function setUpGlobalFloater() {
  const floater = document.createElement('div');
  const pageContent = document.getElementById('pageContent');

  if (pageContent === null) {
    console.log("COulnd't find it");
    setTimeout(setUpGlobalFloater, 100);
  }


  floater.id = 'grafana_docbooks_app_floater';
  pageContent?.parentElement?.appendChild(floater);
  ReactDOM.createRoot(floater).render(<GlobalFloater />)
}

import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { Drawer, IconButton, useStyles2, useTheme2 } from "@grafana/ui";
import React, { useCallback, useEffect, useState } from "react";

import ReactDOM from 'react-dom/client'

type Props = {};

export function GlobalFloater(props: Props) {

  const styles = useStyles2(getStyles);
  const [mouseDown, setMouseDown] = useState(false);
  // const [position, setPosition] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // const [activities, setActivities] = useState<Activity>([]);

  const openDrawer = useCallback(()=>setDrawerOpen(true), [setDrawerOpen]);
  const closeDrawer = useCallback(()=>setDrawerOpen(false), [setDrawerOpen]);
  
  useEffect(()=>{

    // Press d followed by b to open docbooks

    let prevKey = 'x';
    let prevTime = Number.NaN;

    const handleKeyDown = (e: KeyboardEvent) => {

      if (e.target !== document.body) {
        return;
      }

      const deltaTime = e.timeStamp - prevTime;

      if (prevKey === 'd' && e.key === 'b' && deltaTime < 1000) {
        openDrawer();
      }

      prevKey = e.key;
      prevTime = e.timeStamp;

    };
      document.addEventListener('keydown', handleKeyDown, true);
    
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };

  }, [openDrawer]);
  
  useEffect(()=>{
    console.log("MOUSE IS DOWN", mouseDown)
  }, [mouseDown])

  return <div onMouseDown={()=>setMouseDown(true)} onMouseUp={()=>setMouseDown(false)}>
    {isDrawerOpen && <Drawer onClose={closeDrawer} title='Team name here' subtitle='Run books' closeOnMaskClick>
        Hello, thank you for being here.
        <div>
          Do we want this to be a modal blocker?
        </div>
        <div>
          <h1>Events</h1>

        </div>
      </Drawer>
    }
    <IconButton className={styles.floater} aria-label="Open run book" size="xxxl" tooltip={'Run books'} variant="primary" name={'book-open'} onClick={openDrawer}>Run Books</IconButton>
  </div>


}


function getStyles(theme: GrafanaTheme2) {
  return ({
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
  floater.id = 'grafana_docbooks_app_floater';
  document.body.appendChild(floater);
  ReactDOM.createRoot(floater).render(<GlobalFloater />)
}

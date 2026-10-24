/* Alanya Climate Lab 1.0. Deterministic, explicitly parameterised screening.
 * No air-temperature, hydraulic-depth, crop-yield or wildfire-spread solver.
 */
(function(root){
'use strict';
const A=6378137,E2=0.0066943799901413165,K=.9996,EP=E2/(1-E2),RAD=Math.PI/180;
function forward(lon,lat){
 const p=lat*RAD,l=(lon-33)*RAD,s=Math.sin(p),c=Math.cos(p),t=Math.tan(p),N=A/Math.sqrt(1-E2*s*s),T=t*t,C=EP*c*c,B=c*l,e4=E2*E2,e6=e4*E2;
 const M=A*((1-E2/4-3*e4/64-5*e6/256)*p-(3*E2/8+3*e4/32+45*e6/1024)*Math.sin(2*p)+(15*e4/256+45*e6/1024)*Math.sin(4*p)-35*e6/3072*Math.sin(6*p));
 return [500000+K*N*(B+(1-T+C)*B**3/6+(5-18*T+T*T+72*C-58*EP)*B**5/120),K*(M+N*t*(B*B/2+(5-T+9*C+4*C*C)*B**4/24+(61-58*T+T*T+600*C-330*EP)*B**6/720))];
}
function inverse(x,y){
 const e4=E2*E2,e6=e4*E2,mu=(y/K)/(A*(1-E2/4-3*e4/64-5*e6/256)),e1=(1-Math.sqrt(1-E2))/(1+Math.sqrt(1-E2));
 const p=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*Math.sin(4*mu)+151*e1**3/96*Math.sin(6*mu)+1097*e1**4/512*Math.sin(8*mu);
 const s=Math.sin(p),c=Math.cos(p),t=Math.tan(p),N=A/Math.sqrt(1-E2*s*s),R=A*(1-E2)/(1-E2*s*s)**1.5,T=t*t,C=EP*c*c,D=(x-500000)/(N*K);
 return [33+(D-(1+2*T+C)*D**3/6+(5-2*C+28*T-3*C*C+8*EP+24*T*T)*D**5/120)/c/RAD,(p-N*t/R*(D*D/2-(5+3*T+10*C-4*C*C-9*EP)*D**4/24+(61+90*T+298*C+45*T*T-252*EP-3*C*C)*D**6/720))/RAD];
}
function ringContains(x,y,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function contains(x,y,geometry){
 if(geometry.type==='Polygon')return ringContains(x,y,geometry.coordinates[0])&&!geometry.coordinates.slice(1).some(r=>ringContains(x,y,r));
 if(geometry.type==='MultiPolygon')return geometry.coordinates.some(c=>contains(x,y,{type:'Polygon',coordinates:c}));return false;
}
function ringArea(r){let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=r[j][0]*r[i][1]-r[i][0]*r[j][1];return Math.abs(a)/2;}
function area(g){if(g.type==='Polygon')return ringArea(g.coordinates[0])-g.coordinates.slice(1).reduce((s,r)=>s+ringArea(r),0);if(g.type==='MultiPolygon')return g.coordinates.reduce((s,c)=>s+area({type:'Polygon',coordinates:c}),0);return 0;}
function mapCoords(g,fn){const walk=(v,n)=>n===0?fn(v):v.map(x=>walk(x,n-1));const depth={Point:0,LineString:1,Polygon:2,MultiPolygon:3,MultiLineString:2}[g.type];if(depth===undefined)throw Error('Unsupported geometry');return {type:g.type,coordinates:walk(g.coordinates,depth)};}
function project(g){return mapCoords(g,c=>forward(c[0],c[1]));}
function unproject(g){return mapCoords(g,c=>inverse(c[0],c[1]));}
function bounds(g){const pts=[];const add=v=>typeof v[0]==='number'?pts.push(v):v.forEach(add);add(g.coordinates);return [Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];}
function convexHull(points){
 const p=points.map(x=>x.slice(0,2)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 if(p.length<3)return p;const l=[],u=[];for(const x of p){while(l.length>1&&cross(l.at(-2),l.at(-1),x)<=0)l.pop();l.push(x);}for(const x of p.slice().reverse()){while(u.length>1&&cross(u.at(-2),u.at(-1),x)<=0)u.pop();u.push(x);}l.pop();u.pop();return [...l,...u,l[0]];
}
function solar(date,time,lat,lon){
 const d=new Date(date+'T12:00:00Z'),day=Math.floor((d-Date.UTC(d.getUTCFullYear(),0,0))/86400000),h=Number(time),gamma=2*Math.PI/(new Date(Date.UTC(d.getUTCFullYear(),1,29)).getUTCMonth()===1?366:365)*(day-1+(h-12)/24);
 const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
 const dec=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
 const ha=((h*60+eq+4*lon-180)/4-180)*RAD,p=lat*RAD,cosz=Math.max(-1,Math.min(1,Math.sin(p)*Math.sin(dec)+Math.cos(p)*Math.cos(dec)*Math.cos(ha))),elevation=Math.asin(cosz);
 const azimuth=(Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(p)-Math.tan(dec)*Math.cos(p))+Math.PI+Math.PI*2)%(Math.PI*2);
 return {elevation:elevation/RAD,azimuth:azimuth/RAD,elevationRad:elevation,azimuthRad:azimuth};
}
const defaults={rain:50,date:'2026-06-21',hour:15,budget:180000,connected:.25,treeWater:40,parkWater:2.5,gardenWater:1,cnBuilt:.90,cnTree:.25,cnGrass:.25,cnCrop:.40,cnBare:.50,cnPermeable:.30,cnGarden:.15,cnBuilding:.95,treeCost:600,parkCost:35,permeableCost:65,roadCost:80,storageCost:120,gardenCost:60,buildingCost:800,shadeCost:100,demolitionCost:45};
function coefficient(code,p){return code===50?p.cnBuilt:code===10?p.cnTree:[20,30,90,95,100].includes(code)?p.cnGrass:code===40?p.cnCrop:code===60?p.cnBare:0;}
function distSegment(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/n)):0;return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
function featureGeometry(f){
 const g=f.xy||project(f.geometry),p=f.properties||{},kind=p.kind;
 if(kind==='tree'){
  const [x,y]=g.coordinates,r=Number(p.radius)||4,points=Array.from({length:40},(_,i)=>[x+r*Math.cos(i*Math.PI/20),y+r*Math.sin(i*Math.PI/20)]);points.push(points[0]);return {type:'Polygon',coordinates:[points]};
 }return g;
}
function shadowGeometry(f,sun){
 if(sun.elevation<2)return null;const p=f.properties||{},g=f.xy||project(f.geometry),h=Math.max(.1,Number(p.height)||10),dx=-Math.sin(sun.azimuthRad),dy=-Math.cos(sun.azimuthRad),tan=Math.tan(sun.elevationRad);
 if(p.kind==='tree'){
  const r=Math.min(Number(p.radius)||4,h/2),z=h-r,major=r/Math.sin(sun.elevationRad),cx=g.coordinates[0]+dx*z/tan,cy=g.coordinates[1]+dy*z/tan;
  const pts=Array.from({length:48},(_,i)=>{const a=i*Math.PI/24,u=Math.cos(a)*major,v=Math.sin(a)*r;return [cx+dx*u-dy*v,cy+dy*u+dx*v];});pts.push(pts[0]);return {type:'Polygon',coordinates:[pts]};
 }
 if(!['building','shade'].includes(p.kind))return null;
 const polys=g.type==='MultiPolygon'?g.coordinates:[g.coordinates];return {type:'MultiPolygon',coordinates:polys.map(c=>[convexHull([...c[0],...c[0].map(q=>[q[0]+dx*h/tan,q[1]+dy*h/tan])])])};
}
function applyMask(pilot,geometry,fn,expand=0){
 const u=pilot.utm,b=bounds(geometry),x0=Math.max(0,Math.floor((b[0]-expand-u.xmin)/u.step)),x1=Math.min(u.cols-1,Math.ceil((b[2]+expand-u.xmin)/u.step)),y0=Math.max(0,Math.floor((u.ymax-b[3]-expand)/u.step)),y1=Math.min(u.rows-1,Math.ceil((u.ymax-b[1]+expand)/u.step));
 for(let row=y0;row<=y1;row++)for(let col=x0;col<=x1;col++){const x=u.xmin+(col+.5)*u.step,y=u.ymax-(row+.5)*u.step;let hit=false;
  if(geometry.type==='LineString')hit=geometry.coordinates.slice(1).some((v,i)=>distSegment(x,y,geometry.coordinates[i],v)<=expand);
  else hit=contains(x,y,geometry);if(hit)fn(row*u.cols+col,x,y);
 }
}
function compute(pilot,features,config={},inventory=[],removed=[]){
 const p={...defaults,...config},u=pilot.utm,n=u.cols*u.rows,cell=u.step*u.step,base=new Float32Array(n),now=new Float32Array(n),ground=new Uint8Array(n),eligible=new Uint8Array(n),baseBuildings=new Uint8Array(n),buildings=new Uint8Array(n),baseFloors=new Float32Array(n),activeFloors=new Float32Array(n),newFloors=new Float32Array(n),storage=new Float32Array(n),bs=new Uint8Array(n),cs=new Uint8Array(n),removedSet=new Set(removed),sun=solar(p.date,p.hour,pilot.centre[0],pilot.centre[1]);
 let landArea=0,unknownArea=0,treeCount=0,newFloor=0,removedFloor=0,shadeStructureArea=0;
 const projected=features.map(f=>({...f,xy:f.xy||project(f.geometry)})),baseline=inventory.map(f=>({...f,xy:f.xy||project(f.geometry),properties:{...f.properties,kind:'building'}}));
 for(let i=0;i<n;i++){const c=pilot.landcover[i];if(c!==0&&c!==80){eligible[i]=1;landArea+=cell;}else if(c===0)unknownArea+=cell;base[i]=now[i]=coefficient(c,p);}
 for(const f of baseline){const floors=Math.max(1,Number(f.properties.floors)||Math.round((Number(f.properties.height)||9)/3));applyMask(pilot,f.xy,i=>{if(eligible[i]){baseBuildings[i]=1;baseFloors[i]=Math.max(baseFloors[i],floors);if(!removedSet.has(f.id))activeFloors[i]=Math.max(activeFloors[i],floors);}});const sg=shadowGeometry(f,sun);if(sg)applyMask(pilot,sg,i=>{if(eligible[i])bs[i]=1;});}
 for(let i=0;i<n;i++){if(baseBuildings[i])base[i]=now[i]=p.cnBuilding;}
 const kinds={park:1,permeable:2,road:3,storage:4,garden:5};
 for(const f of projected){const q=f.properties||{},k=q.kind,g=featureGeometry(f);if(k==='tree'){treeCount++;continue;}if(k==='building'){applyMask(pilot,g,i=>{if(eligible[i])newFloors[i]=Math.max(newFloors[i],Math.max(1,Number(q.floors)||1));});continue;}if(k==='shade'){shadeStructureArea+=area(g);continue;}
  if(kinds[k])applyMask(pilot,g,i=>{if(!eligible[i])return;ground[i]=kinds[k];storage[i]=(k==='storage'||k==='garden')?Math.max(0,Number(q.depth)||.2):0;},k==='road'?Number(q.width||6)/2:0);
 }
 const activeBuildings=[...baseline.filter(f=>!removedSet.has(f.id)),...projected.filter(f=>f.properties.kind==='building')];
 for(const f of activeBuildings)applyMask(pilot,featureGeometry(f),i=>{if(eligible[i])buildings[i]=1;});
 for(const f of [...baseline.filter(f=>!removedSet.has(f.id)),...projected]){const sg=shadowGeometry(f,sun);if(sg)applyMask(pilot,sg,i=>{if(eligible[i])cs[i]=1;});}
 let baseRunoff=0,runoff=0,capacity=0,parkArea=0,gardenArea=0,permeableArea=0,roadArea=0,storageArea=0,newBuildingArea=0,baseShade=0,currentShade=0,imperviousBase=0,imperviousNow=0,baseFloodArea=0,currentFloodArea=0,floodKnownArea=0;
 const h=pilot.hazards?.[p.hazard||'river100'];
 for(let i=0;i<n;i++){
  if(!eligible[i])continue;
  if(baseBuildings[i]&&!buildings[i]&&!ground[i]){now[i]=p.cnBare;ground[i]=7;}
  newFloor+=newFloors[i]*cell;removedFloor+=Math.max(0,baseFloors[i]-activeFloors[i])*cell;
  switch(ground[i]){case 1:now[i]=p.cnGrass;parkArea+=cell;break;case 2:now[i]=p.cnPermeable;permeableArea+=cell;break;case 3:now[i]=p.cnBuilt;roadArea+=cell;break;case 4:now[i]=p.cnGrass;storageArea+=cell;break;case 5:now[i]=p.cnGarden;gardenArea+=cell;break;}
  if(buildings[i]){now[i]=p.cnBuilding;ground[i]=6;}
  if(!buildings[i])capacity+=storage[i]*cell;
  baseRunoff+=base[i]*cell*p.rain/1000;runoff+=now[i]*cell*p.rain/1000;
  if(pilot.landcover[i]===50||baseBuildings[i])imperviousBase+=cell;
  if(buildings[i]||ground[i]===3||(!ground[i]&&pilot.landcover[i]===50))imperviousNow+=cell;
  if(buildings[i]&&!baseBuildings[i])newBuildingArea+=cell;
  if(bs[i]&&!baseBuildings[i])baseShade+=cell;if(cs[i]&&!buildings[i])currentShade+=cell;
  if(h&&h[i]>=0){floodKnownArea+=cell;if(h[i]>=.1){if(baseBuildings[i])baseFloodArea+=cell;if(buildings[i])currentFloodArea+=cell;}}
 }
 // Raster areas beneath active buildings never count as converted green space.
 parkArea=permeableArea=roadArea=storageArea=gardenArea=0;
 for(let i=0;i<n;i++){if(!eligible[i]||buildings[i])continue;switch(ground[i]){case 1:parkArea+=cell;break;case 2:permeableArea+=cell;break;case 3:roadArea+=cell;break;case 4:storageArea+=cell;break;case 5:gardenArea+=cell;break;}}
 const retained=Math.min(capacity,Math.max(0,runoff)*Math.max(0,Math.min(1,p.connected))),outflow=Math.max(0,runoff-retained),water=(treeCount*p.treeWater+parkArea*p.parkWater+gardenArea*p.gardenWater)/1000;
 const cost=treeCount*p.treeCost+parkArea*p.parkCost+permeableArea*p.permeableCost+roadArea*p.roadCost+capacity*p.storageCost+gardenArea*p.gardenCost+newFloor*p.buildingCost+shadeStructureArea*p.shadeCost+removedFloor*p.demolitionCost;
 return {landArea,unknownArea,treeCount,parkArea,permeableArea,roadArea,storageArea,gardenArea,newBuildingArea,imperviousBase,imperviousNow,imperviousChange:imperviousNow-imperviousBase,baseRunoff,runoff,retained,outflow,runoffReduction:baseRunoff-outflow,capacity,water,cost,budget:p.budget,remaining:p.budget-cost,newFloor,removedFloor,floorChange:newFloor-removedFloor,baseShade,currentShade,shadeChange:currentShade-baseShade,floodKnownArea,baseFloodArea,currentFloodArea,floodChange:currentFloodArea-baseFloodArea,sun,ground,buildings,shadows:cs,baseShadows:bs};
}
function decodeGrid(grid){const b=typeof atob==='function'?Uint8Array.from(atob(grid.rle),c=>c.charCodeAt(0)):new Uint8Array(Buffer.from(grid.rle,'base64')),view=new DataView(b.buffer,b.byteOffset,b.byteLength),a=new Uint8Array(grid.width*grid.height);let pos=0;for(let i=0;i<b.length;i+=5){const c=view.getUint8(i),count=view.getUint32(i+1,true);if(pos+count>a.length)throw Error('Invalid RLE');a.fill(c,pos,pos+count);pos+=count;}if(pos!==a.length)throw Error('Incomplete RLE');return a;}
function makePilot(lon,lat,nativeGrid,decoded,hazardGeometry,id){
 let [cx,cy]=forward(lon,lat);cx=Math.round(cx/20)*20;cy=Math.round(cy/20)*20;
 const u={epsg:32636,xmin:cx-500,ymax:cy+500,step:5,cols:200,rows:200},landcover=[],hazards={},candidates={};
 for(const [k,fs] of Object.entries(hazardGeometry)){candidates[k]=fs.filter(f=>f.bounds[0]<=cx+500&&f.bounds[2]>=cx-500&&f.bounds[1]<=cy+500&&f.bounds[3]>=cy-500);hazards[k]=Array(40000).fill(-1);}
 for(let row=0;row<200;row++)for(let col=0;col<200;col++){const x=u.xmin+(col+.5)*5,y=u.ymax-(row+.5)*5,sc=Math.floor((x-nativeGrid.xmin)/nativeGrid.step),sr=Math.floor((nativeGrid.ymax-y)/nativeGrid.step),i=row*200+col;landcover.push(sc>=0&&sc<nativeGrid.width&&sr>=0&&sr<nativeGrid.height?decoded[sr*nativeGrid.width+sc]:0);for(const [k,fs] of Object.entries(candidates)){for(const f of fs){if(x>=f.bounds[0]&&x<=f.bounds[2]&&y>=f.bounds[1]&&y<=f.bounds[3]&&contains(x,y,f.geometry))hazards[k][i]=f.value;}}}
 const sw=inverse(cx-500,cy-500),ne=inverse(cx+500,cy+500);return {id:id||'custom-'+cx+'-'+cy,name:{tr:'Seçilen alan',en:'Custom area'},centre:[lat,lon],bounds:[[sw[1],sw[0]],[ne[1],ne[0]]],utm:u,landcover,hazards,source:'ESA WorldCover 2021 v200 · 20 m'};
}
const api={forward,inverse,contains,area,bounds,project,unproject,featureGeometry,shadowGeometry,solar,compute,defaults,decodeGrid,makePilot,applyMask};
root.LabEngine=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

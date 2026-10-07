import * as THREE from 'three';
import {createElement, House, Utensils, Footprints, Dumbbell, PersonStanding, ChartNoAxesCombined, Settings, Play, Pause, RotateCcw, ArrowUpRight, Cloud, Check, Sun, Moon} from 'lucide';
window.THREE = THREE;
const icons = {today:House,food:Utensils,cardio:Footprints,resistance:Dumbbell,fitness:PersonStanding,progress:ChartNoAxesCombined,profile:Settings,play:Play,pause:Pause,reset:RotateCcw,arrow:ArrowUpRight,cloud:Cloud,check:Check,sun:Sun,moon:Moon};
window.AppIcons = {markup(name){return createElement(icons[name]||Dumbbell,{width:20,height:20,'stroke-width':1.8,'aria-hidden':'true'}).outerHTML;}};

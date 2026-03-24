import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function SNRChart({snr}){

if(!snr) return null;

const data = Object.keys(snr).map(k=>({
lead:k,
snr:snr[k]
}));

return(

<div>

<h3>SNR per Lead</h3>

<BarChart width={700} height={300} data={data}>

<XAxis dataKey="lead"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="snr" fill="#047857"/>

</BarChart>

</div>

)

}
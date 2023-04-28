export default function ScrollWithStar() {
    return (<div className="scroll-with-star" style={{ zIndex: 1000, position: 'absolute', left: '3%', bottom: '5%', width: '43px', height: '43px' }}  >
        <i class="fa-solid fa-scroll" style={{ fontSize: '40px', color: 'white', zIndex: 1000, }} onClick={() => console.log('clicked')} />
        <i style={{ fontSize: "11px", color: 'red', position: 'relative', bottom: '45px', left: '14px' }} class="fa-solid fa-certificate" />
        <i style={{ fontSize: "6px", color: 'gold', position: 'relative', bottom: '47px', left: '6px' }} class="fa-solid fa-certificate" />
        <span style={{ color: 'black', fontFamily: "Times New Roman, serif", position: 'relative', bottom: '39px', right: '13px' }} >I</span>
    </div>);
}
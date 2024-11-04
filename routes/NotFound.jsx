import {Link} from "react-router-dom";

const NotFound = () => {

    return (
        <div className="notFound">
            <div className="return404 xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]">
                {/* <p style={{color: "rgb(255, 102, 102)", fontSize: "2em"}}></p> */}
                <Link  to="/">
                    Return Home to your DiscreteMentor
                </Link>
            </div>
        </div>
    )
}

export default NotFound
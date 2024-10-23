import {Link} from "react-router-dom";

const NotFound = () => {

    return (
        <div className="notFound">
            <div className="return404 text-2xl border-2">
                {/* <p style={{color: "rgb(255, 102, 102)", fontSize: "2em"}}></p> */}
                <Link  to="/">
                    Return Home to Your DiscreteMentor
                </Link>
            </div>
        </div>
    )
}

export default NotFound
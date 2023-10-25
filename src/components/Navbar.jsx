import React from "react";

const Navbar = () => {
    return (
        <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container-fluid">
            <a href="#" class="navbar-brand fs-4">Memes</a>
            <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
                <div class="navbar-nav ms-auto fs-6">
                    <a href="#" class="nav-item nav-link"> <span className="mx-3">Home</span> </a>
                    <a href="#" class="nav-item nav-link"><span className="mx-3">Memes</span></a>
                    <a href="#" class="nav-item nav-link"><span className="mx-3">About</span></a>
                </div>
            </div>
        </div>
    </nav>
      
    );
}

export default Navbar;

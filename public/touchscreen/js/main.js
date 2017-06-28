var currentApp         = 0;
var yearSelection      = document.getElementById('year-selection');
var yearContainer      = document.getElementById('year-container');
var years              = yearSelection.getElementsByClassName('year');
var yearOffset         = years[1].offsetLeft - years[0].offsetLeft;
var yearScroll         = 0;
var json;
var currentYear        = 0;
var aF;
var scrollTimeout;
var autoScroll         = false;
var projectSelection   = document.getElementById('project-selection');
var projectPrev        = document.getElementById('project-prev');
var projectNext        = document.getElementById('project-next');
var projectName        = document.getElementById('project-name');
var projectDescription = document.getElementById('project-info-description');
var projectInstruction = document.getElementById('project-info-instruction');
var projectStudent     = document.getElementById('project-info-student');

function init() {
    yearContainer.scrollLeft = yearContainer.scrollWidth;

    for(var i = 0, l = years.length; i < l; i++) {
        (function(i) {
            years[i].addEventListener('click', function(e) {
                years[currentYear].classList.remove('active');
                currentYear = i;
                years[currentYear].classList.add('active');
                scrollToCurrentYear();
            });
        })(i);
    }

    addMultipleEventListener('mousedown touchstart', [projectPrev, projectNext, projectName], function(e) {
        if(document.body.classList.contains('light')) {
            this.style.backgroundColor = 'rgba(0, 90, 106, 0.25)';
        } else {
            this.style.backgroundColor = 'rgb(50, 50, 50)';
        }
    });
    addMultipleEventListener('mouseup touchend', [projectPrev, projectNext, projectName], function(e) {
        this.style.backgroundColor = '';
    });

    setupApp(currentApp);

    projectPrev.addEventListener('click', function(e) {
        document.body.classList.add('loading');
        socket.emit('loading');
        setTimeout(function() {
            for(var i = 0, l = apps[currentApp].modules.length; i < l; i++) {
                apps[currentApp].modules[i].DOMElement.classList.add("inactive");
            }
            currentApp--;
            if(currentApp < 0) currentApp = apps.length - 1;
            setupApp(currentApp);
            socket.emit('switchApp', JSON.stringify({"app" : apps[currentApp].infos.folder}));
        }, 1000);
    });

    projectNext.addEventListener('click', function(e) {
        document.body.classList.add('loading');
        socket.emit('loading');
        setTimeout(function() {
            for(var i = 0, l = apps[currentApp].modules.length; i < l; i++) {
                apps[currentApp].modules[i].DOMElement.classList.add("inactive");
            }
            currentApp++;
            if(currentApp > apps.length - 1) currentApp = 0;
            setupApp(currentApp);
            socket.emit('switchApp', JSON.stringify({"app" : apps[currentApp].infos.folder}));
        }, 1000);
    });

    projectName.addEventListener('click', function(e) {
        projectSelection.classList.toggle('active');
    }, false);

    changeCurrentApp();
    requestAnimationFrame(loop);
} init();

function setupApp(index) {
    for(var i = 0, l = apps[index].modules.length; i < l; i++) {
        apps[index].modules[i].DOMElement.classList.remove("inactive");
    }

    projectName.innerHTML        = apps[index].infos.project;
    projectDescription.innerHTML = apps[index].infos.description;
    projectStudent.innerHTML     = apps[index].infos.student;
    projectInstruction.innerHTML = "";
    for(var i = 0, l = apps[index].infos.instructions.length; i < l; i++) {
        projectInstruction.innerHTML += "— ";
        projectInstruction.innerHTML += apps[index].infos.instructions[i];
        if(i < l - 1) projectInstruction.innerHTML += "<br>";
    }
}

function loop() {
    yearScroll = yearContainer.scrollLeft;
    for(var i = 0, l = years.length; i < l; i++) {
        if(yearScroll + yearSelection.offsetWidth / 2 < years[i].offsetLeft + yearOffset / 2) {
            if(currentYear != i) {
                years[currentYear].classList.remove('active');
                currentYear = i;
                years[currentYear].classList.add('active');
                json = JSON.stringify({
                    event : "switchYearAlpha",
                    year  : years[currentYear].dataset.year
                });
                socket.emit('sendData', json);
            }
            break;
        }
    }
    updateAnimations();
    aF = requestAnimationFrame(loop);
}

function changeCurrentApp() {

}

yearContainer.addEventListener('scroll', function(e) {
    if(!autoScroll) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(scrollToCurrentYear, 100);
    }
}, false);

function scrollToCurrentYear() {
    autoScroll = true;
    startAnimation({
        target: yearContainer,
        property: "scrollLeft",
        duration: 30,
        to: years[currentYear].offsetLeft - yearSelection.offsetWidth / 2,
        start: function() {
            yearContainer.style.overflowX = 'hidden';
            json = JSON.stringify({
                event : "switchYear",
                year  : years[currentYear].dataset.year
            });
            socket.emit('sendData', json);
        },
        finish: function() {
            yearContainer.style.overflowX = '';
            setTimeout(function() { autoScroll = false; }, 100);
        }
    });
}

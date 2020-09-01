FROM raspbian/stretch:latest

RUN apt-get update -y
RUN apt-get install -y curl git
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN sudo apt install -y nodejs

RUN mkdir /opt/TEDMirror
RUN cd /opt/TEDMirror && \
    git clone https://github.com/chizhang0814/TEDMirror.git

#cd  /opt/TEDMirror/ && \
#mkdir clientonly config css fonts installers js modules serveronly splashscreen tests translations vendor
#ADD .github  /opt/TEDMirror/.github
#ADD clientonly /opt/TEDMirror/clientonly
#ADD config /opt/TEDMirror/config
#ADD css /opt/TEDMirror/css
#ADD fonts /opt/TEDMirror/fonts
#ADD installers /opt/TEDMirror/installers
#ADD js /opt/TEDMirror/js
#ADD modules /opt/TEDMirror/modules
#ADD serveronly /opt/TEDMirror/serveronly
#ADD splashscreen /opt/TEDMirror/splashscreen
#ADD tests /opt/TEDMirror/tests
#ADD translations /opt/TEDMirror/translations
#ADD vendor /opt/TEDMirror/vendor
#COPY * /opt/TEDMirror/

#Decrypt archive
gpg --output ./archive.tgz --decrypt ./archive.tgz.gpg

#Verify file integrity
sha256sum -c archive.sha256

#Extract archive, x:extract content, v:show files, f:filename
tar -xvf archive.tgz

#Load image
docker load < ./node20.tar

#Keep only archive & sha256
rm ./archive.tgz ./archive.sha256 ./archive.tgz.gpg ./node20.tar
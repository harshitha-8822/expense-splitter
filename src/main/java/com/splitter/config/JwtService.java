package com.splitter.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(String email) {
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(email)
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + expiration))
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256), claims);

            signedJWT.sign(new MACSigner(secret.getBytes()));
            return signedJWT.serialize();

        } catch (Exception e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    public String extractEmail(String token) {
        try {
            return SignedJWT.parse(token).getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Error extracting email", e);
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            MACVerifier verifier = new MACVerifier(secret.getBytes());
            boolean validSignature = signedJWT.verify(verifier);
            boolean notExpired = signedJWT.getJWTClaimsSet()
                    .getExpirationTime().after(new Date());
            boolean emailMatches = signedJWT.getJWTClaimsSet()
                    .getSubject().equals(userDetails.getUsername());
            return validSignature && notExpired && emailMatches;
        } catch (Exception e) {
            return false;
        }
    }
}